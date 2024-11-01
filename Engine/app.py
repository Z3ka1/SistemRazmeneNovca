from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests
from flask_cors import CORS
from multiprocessing import Process, Queue, resource_tracker
import time
from threading import Thread

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

CORS(app)
CORS(app, supports_credentials=True, headers=['Content-Type', 'Authorization'])


EXCHANGE_RATE_API = "https://v6.exchangerate-api.com/v6/84da0ca6eca0cde00ef3f0ac/latest/"
THREAD_WAIT_SECONDS = 60

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:tatamata@localhost:5432/testbaza'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#Kreiranje tabela baze
class Users(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    isAdmin = db.Column(db.Boolean)
    firstName = db.Column(db.String(30))
    lastName = db.Column(db.String(30))
    address = db.Column(db.String(50))
    city = db.Column(db.String(30))
    country = db.Column(db.String(30))
    phoneNumber = db.Column(db.String(20))
    email = db.Column(db.String(30), unique = True)
    password = db.Column(db.String(30))
    isVerified = db.Column(db.Boolean)

    #Posto je primary_key id ce biti automatski kreiran
    def __init__(self, isAdmin, firstName, lastName, address, city, country, phoneNumber, 
                 email, password, isVerified):
        self.isAdmin = isAdmin
        self.firstName = firstName
        self.lastName = lastName
        self.address = address
        self.city = city
        self.country = country
        self.phoneNumber = phoneNumber
        self.email =email
        self.password = password
        self.isVerified = isVerified

    #Stavljamo ceo objekat u recnik kako bi bio Serializable za jsonify()
    def to_dict(self):
        return {
            'id' : self.id,
            'isAdmin' : self.isAdmin,
            'firstName' : self.firstName,
            'lastName' : self.lastName,
            'address' : self.address,
            'city' : self.city,
            'country' : self.country,
            'phoneNumber' : self.phoneNumber,
            'email' : self.email,
            'password' : self.password,
            'isVerified' : self.isVerified
        }

class Cards(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(16), unique = True)
    holderId = db.Column(db.Integer)
    holderFirstName = db.Column(db.String(30))
    holderLastName = db.Column(db.String(30))
    securityCode = db.Column(db.String(3))
    balance = db.Column(db.Double)
    currency = db.Column(db.String(3))
    isVerified = db.Column(db.Boolean)

    def __init__(self, number, holderId, holderFirstName, holderLastName, securityCode, balance, currency, isVerified):
        self.number = number
        self.holderId = holderId
        self.holderFirstName = holderFirstName
        self.holderLastName = holderLastName
        self.securityCode = securityCode
        self.balance = balance
        self.currency = currency
        self.isVerified = isVerified

    def to_dict(self):
        return {
            'id' : self.id,
            'number' : self.number,
            'holderId' : self.holderId,
            'holderFirstName' : self.holderFirstName,
            'holderLastName' : self.holderLastName,
            'securityCode' : self.securityCode,
            'balance' : self.balance,
            'currency' : self.currency,
            'isVerified': self.isVerified,
        }

#transactionQueue = Queue()

class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    senderCardNumber = db.Column(db.String(16))
    recipientCardNumber = db.Column(db.String(16))
    amount = db.Column(db.Double)
    currency = db.Column(db.String(3))
    isDone = db.Column(db.Boolean)

    def __init__(self, senderCardNumber, recipientCardNumber, amount, currency, isDone):
        self.senderCardNumber = senderCardNumber
        self.recipientCardNumber = recipientCardNumber
        self.amount = amount
        self.currency = currency
        self.isDone = isDone

    def to_dict(self):
        return {
            'id' : self.id,
            'senderCardNumber' : self.senderCardNumber,
            'recipientCardNumber' : self.recipientCardNumber,
            'amount' : self.amount,
            'currency' : self.currency,
            'isDone' : self.isDone
        }

def sendMail(subject, body, receiver):
    senderEmail = 'sistemrazmene@outlook.com'
    senderPassword = 'razmenanovca123'

    message = MIMEMultipart()
    message['From'] = senderEmail
    message['To'] = receiver
    message['Subject'] = subject

    bodyStr = str(body)
    message.attach(MIMEText(bodyStr,'plain'))

    try:
        server = smtplib.SMTP('smtp.office365.com', 587)
        server.starttls()

        server.login(senderEmail, senderPassword)
        server.sendmail(senderEmail, receiver, message.as_string())

        server.quit()
        print("Email sent to: '" + receiver + "'!")
    except Exception as e:
        print(f"Error in mail sending: {e}")


#Trazi usera po emailu i vraca ga na UI
#login, 
@app.route('/returnUser', methods=['GET', 'POST'])
def returnUser():
    data = request.get_json()
    recvEmail = data['email']
    recvPassword = data['password']

    user = Users.query.filter_by(email = recvEmail).first()

    if user is not None:
        if recvPassword == user.password:
            userDict = user.to_dict()
            return jsonify({'user': userDict, 'message':'Ulogovali ste se!'}),200
        else:
            return jsonify({'message' : 'Pogresna lozinka.'}), 400
    return jsonify({'message':'Korisnik nije pronadjen.'}), 400

#Prima podatke za novog usera i ubacuje ga u bazu
#register
@app.route('/registerUser', methods=['POST'])
def registerUser():
    data = request.get_json()
    recvFirstName = data['firstName']
    recvLastName = data['lastName']
    recvAddress = data['address']
    recvCity =  data['city']
    recvCountry = data['country']
    recvPhoneNumber = data['phoneNumber']
    recvEmail = data['email']
    recvPassword = data['password']

    checkUser = Users.query.filter_by(email = recvEmail).first()
    if checkUser is None:
        newUser = Users(False,recvFirstName,recvLastName,recvAddress, recvCity, recvCountry, recvPhoneNumber,
                        recvEmail,recvPassword,False)
        db.session.add(newUser)
        db.session.commit()
        
        #slanje mejla novom useru sa njegovim kredencijalima
        sendMail("Podaci za prijavu", 
                 "Registracija na sistem razmene novca je uspesna! Vasi podaci za "
                 +"prijavu su sledeci:\nEmail: " + newUser.email + "\nLozinka: " + newUser.password
                 +"\n\nPreporucujemo promenu inicijalne lozinke nakon prve prijave!"
                 ,newUser.email)

        return jsonify({'message': 'Novi korisnik uspesno kreiran!'}), 200
    else:
        return jsonify({'message': 'Email je vec u upotrebi!'}), 400
    
#Prima nove podatke za postojeceg usera i menja bazu
#update
@app.route('/updateUser', methods=['POST'])
def updateUser():
    data = request.get_json()
    recvFirstName = data['firstName']
    recvLastName = data['lastName']
    recvAddress = data['address']
    recvCity =  data['city']
    recvCountry = data['country']
    recvPhoneNumber = data['phoneNumber']
    recvEmail = data['email']
    recvPassword = data['password']
    recvNewPassword = data['newPassword']
    recvOldEmail = data['oldEmail']

    checkUser = Users.query.filter_by(email = recvOldEmail).first()
    if checkUser:
        if checkUser.password == recvPassword:
            checkUser.firstName = recvFirstName
            checkUser.lastName = recvLastName
            checkUser.address = recvAddress
            checkUser.city = recvCity
            checkUser.country = recvCountry
            checkUser.phoneNumber = recvPhoneNumber
            checkUser.email = recvEmail
            checkUser.password = recvNewPassword
            db.session.commit()
            userDict = checkUser.to_dict()
            return jsonify({'user':userDict, 'message': 'Vasi podaci uspesno izmenjeni!'}), 200
        else:
            return jsonify({'message': 'Greska, ne ispravna lozinka'}), 400
    else:
        return jsonify({'message': 'Greska, izmena nije uspela'}), 404
    
#Za prosledjene podatke pravi novu karticu ukoliko se ime i prezime poklapa sa
#imenom i prezimenom ulogovanog korisnika
@app.route('/addCard', methods=['POST'])
def addCard():
    data = request.get_json()
    recvNumber = data['number']
    recvHolderId = data['holderId']
    recvHolderFirstName = data['holderFirstName']
    recvHolderLastName =  data['holderLastName']
    recvSecurityCode = data['securityCode']
    recvBalance = data['balance']
    recvCurrency = data['currency']

    checkCard = Cards.query.filter_by(number = recvNumber).first()
    checkUser = Users.query.filter_by(id = recvHolderId).first()

    if checkUser is not None:
        if checkUser.firstName == recvHolderFirstName and checkUser.lastName == recvHolderLastName:
            if checkCard is None:
                newCard = Cards(recvNumber,recvHolderId,recvHolderFirstName,recvHolderLastName,recvSecurityCode,recvBalance, recvCurrency, False)
                db.session.add(newCard)
                db.session.commit()
                return jsonify({'message':'Kartica poslata na verifikaciju!'}), 200
            else:
                return jsonify({'message':'Greska, kartica sa datim brojem je vec registrovana'}), 400
        else:
            return jsonify({'message':'Greska, ime i prezime na kartici se ne poklapa sa vasim imenom i prezimenom'}), 400
    else:
        return jsonify({'message':'Greska, korisnik kartice nije pronadjen u bazi'}),400

#za prosledjen id kartice i id korisnika kartice verifikuje karticu i korisnika(ukoliko vec nije verifikovan)
@app.route('/verifyCard', methods=['POST'])
def verifyCard():
    data = request.get_json()
    recvCardId = data['cardId']
    recvHolderId = data['holderId']

    findCard = Cards.query.filter_by(id = recvCardId).first()
    findUser = Users.query.filter_by(id = recvHolderId).first()

    if findCard is not None:
        findCard.isVerified = True
        db.session.commit()
        if findUser is not None:
            if findUser.isVerified == False:
                findUser.isVerified = True
                db.session.commit()
                userDict = findUser.to_dict()
                return jsonify({'user':userDict, 'message' : 'Kartica i korisnik uspesno verifikovani'}), 200
            return jsonify({'message':'Kartica uspesno verifikovana'}), 200
        else:
            return jsonify({'message':'Greska, korisnik nije pronadjen i ne moze se verifikovati'}), 400
    else:
        return jsonify({'message':'Greska, kartica nije pronadjena u bazi'}), 400
    
# Kontroler za vraćanje svih kartica
@app.route('/returnAllCards', methods=['POST'])
def returnAllCards():
    cards = Cards.query.all()
    cardList = [card.to_dict() for card in cards]
    return jsonify({'cards': cardList}), 200

#Za prosledjeni id korisnika vraca sve njegove kartice na UI
@app.route('/returnCardsByHolderId', methods=['POST'])
def returnCardsByHolderId():
    data = request.get_json()
    recvHolderId = data['holderId']

    cards = Cards.query.filter_by(holderId = recvHolderId).all()
    cardList = [card.to_dict() for card in cards]

    return jsonify({'cards':cardList}), 200

@app.route('/returnVerifiedCardsByHolderId', methods=['POST'])
def returnVerifiedCardsByHolderId():
    data = request.get_json()
    recvHolderId = data['holderId']

    cards = Cards.query.filter_by(holderId = recvHolderId, isVerified = True).all()

    cardList = [card.to_dict() for card in cards]

    return jsonify({'cards':cardList}), 200

#Dodaje novac na karticu sa prosledjenim IDjem u prosledjenoj valuti
#Ukoliko je kartica u drugoj valuti od prosledjene, sredstva ce biti konvertovana i uplacena
#Obratiti paznju na format za currency (EUR, RSD...)
@app.route('/addBalance', methods=['POST'])
def addBalance():
    data = request.get_json()
    recvCardId = data['cardId']
    recvAmount = float(data['amount'])
    recvCurrency = data['currency']

    findCard = Cards.query.filter_by(id = recvCardId).first()

    if findCard is not None:
        if findCard.currency != recvCurrency:
            response = requests.get(EXCHANGE_RATE_API + recvCurrency)
            exc = response.json()
            rate = exc['conversion_rates'][findCard.currency]
            
            newAmount = rate * recvAmount
            findCard.balance += newAmount
            db.session.commit()
        else:
            findCard.balance += recvAmount
            db.session.commit()
        return jsonify({'message' : 'Uspesna uplata!'}), 200
    else:
        return jsonify({'message' : 'Greska, kartica nije pronadjena!'}), 400

#Prebacuje sredstva kartice u prosledjenu valutu
@app.route('/convertCardCurrency', methods = ['POST'])
def convertCardCurrency():
    data = request.get_json()
    recvCardId = data['cardId']
    recvCurrency = data['currency']

    findCard = Cards.query.filter_by(id=recvCardId).first()
    
    if findCard is not None:
        response = requests.get(EXCHANGE_RATE_API + findCard.currency)
        exc = response.json()
        rate = exc['conversion_rates'][recvCurrency]

        newBalance = rate * findCard.balance
        findCard.balance = newBalance
        findCard.currency = recvCurrency
        db.session.commit()
        return jsonify({'message':'Stanje racuna uspesno konvertovano u novu valutu!'}), 200
    else:
        return jsonify({'message' : 'Greska, kartica nije pronadjena!'}), 400

transactionQueue = []
class TransactionThread(Thread):
    def run(self):
        with app.app_context():
            while True:
                #print(len(transactionQueue))
                while transactionQueue:
                    transactionId = transactionQueue.pop(0)
                    processTransaction(transactionId)
                time.sleep(THREAD_WAIT_SECONDS)

#za valutu uzima valutu kartice sa koje se salje novac
@app.route('/newTransaction', methods = ['POST'])
def newTransaction():
    data = request.get_json()
    recvSenderCardNumber = data['senderCardNumber']
    recvRecipientCardNumber = data['recipientCardNumber']
    recvAmount = float(data['amount'])
    recvRecipientEmail = data['recipientEmail']
    recvRecipientFirstName = data['recipientFirstName']
    recvRecipientLastName = data['recipientLastName']

    senderCard = Cards.query.filter_by(number = recvSenderCardNumber).first()
    if senderCard is None:
        return jsonify({'message':'Transakcija nije napravljena, kartica posiljaoca nije pronadjena!'}), 400

    recipientCard = Cards.query.filter_by(number = recvRecipientCardNumber).first()
    if recipientCard is None:
        return jsonify({'message':'Transakcija nije napravljena, kartica primaoca nije pronadjena!'}), 400

    if not senderCard.isVerified:
        return jsonify({'message':'Transakcija nije napravljena, kartica posiljaoca nije verifikovana!'})

    recipient = Users.query.filter_by(id = recipientCard.holderId).first()
    if recipient is None:
        return jsonify({'message':'Transakcija nije napravljena, vlasnik kartice nije pronadjen!'}), 400

    if recipient.email != recvRecipientEmail:
        return jsonify({'message':'Transakcija nije napravljena, uneta email adresa ne pripada primaocu sredstava!'}), 400

    if recipient.firstName.upper() != recvRecipientFirstName.upper():
        return jsonify({'message':'Transakcija nije napravljena, uneto ime ne pripada primaocu sredstava!'}), 400

    if recipient.lastName.upper() != recvRecipientLastName.upper():
        return jsonify({'message':'Transakcija nije napravljena, uneto ime ne pripada primaocu sredstava!'}), 400

    #NE RADI KADA SE KREIRA VISE TRANSAKCIJA U PERIODU OD JEDNE MINUTE ZA ISTOG POSILJAOCA
    #     PREBACITI U processTransaction - RACUN MOZE UCI U MINUS
    # if senderCard.balance < recvAmount:
    #     return jsonify({'message':'Transakcija nije napravljena, nemate dovoljno sredstava na racunu!'}), 400

    #Prolazi kroz sve transakcije koje nisu izvrsene i proverava da li je ostalo dovnoljno novca na racunu
    totalAmountInTransactions = 0.0
    transactions = Transactions.query.all()
    if transactions is not None:
        for trans in transactions:
            if trans.senderCardNumber == senderCard.number and trans.isDone == False:
                response = requests.get(EXCHANGE_RATE_API + trans.currency)
                exc = response.json()
                rate = exc['conversion_rates'][senderCard.currency]
                totalAmountInTransactions += rate * trans.amount
    totalAmountInTransactions += recvAmount
    if senderCard.balance < totalAmountInTransactions:
        return jsonify({'message':'Transakcija nije napravljena, nemate dovoljno sredstava na racunu!'}), 400

    newTransaction = Transactions(senderCard.number, recipientCard.number, recvAmount, senderCard.currency, False)
    db.session.add(newTransaction)
    db.session.commit()

    #transactionQueue.put(newTransaction)
    transactionQueue.append(newTransaction.id)
    return jsonify({'message':'Transakcija napravljena i ceka na izvrsenje!'}), 200

def processTransaction(transactionId):
    transaction = Transactions.query.filter_by(id = transactionId).first()
    senderCard = Cards.query.filter_by(number = transaction.senderCardNumber).first()
    recipientCard = Cards.query.filter_by(number = transaction.recipientCardNumber).first()
    
    response = requests.get(EXCHANGE_RATE_API + senderCard.currency)
    exc = response.json()
    rate = exc['conversion_rates'][recipientCard.currency]
    amountInSecondCurrency = rate * transaction.amount
    
    sender = Users.query.filter_by(id = senderCard.holderId).first()
    recipient = Users.query.filter_by(id = recipientCard.holderId).first()
    if senderCard is not None and recipientCard is not None and sender is not None and recipient is not None:
        senderCard.balance -= transaction.amount
        recipientCard.balance += amountInSecondCurrency
        transaction.isDone = True
        db.session.commit()
        
      
        sendMail("Transakcija uspesna", 
                "Vasa transakcija je uspesna! \nSa vaseg racuna '" + transaction.senderCardNumber
                +"' prebacena su sredstva na racun: '" + transaction.recipientCardNumber 
                +"' u iznosu od " + str(transaction.amount) + " " + transaction.currency.upper()
                +".\n\nHvala sto koristite nase usluge!"
                ,sender.email)
        sendMail("Pristigla transakcija", 
                "Na vas racun '" + transaction.recipientCardNumber + "' prebacena su sredstva u vrednosti od "
                + str(transaction.amount) + " " + transaction.currency.upper() + " sa racuna '" + transaction.senderCardNumber
                +"'. Posiljalac " + recipient.firstName + " " + recipient.lastName
                +".\n\nHvala sto koristite nase usluge!"
                ,recipient.email)
    print("Transakcija ID:'" + str(transactionId) + "' obavljena")
        
@app.route('/returnAllTransactions', methods=['POST'])
def returnAllTransactions():
    transactions = Transactions.query.all()
    transactionsList = [transaction.to_dict() for transaction in transactions]
    return jsonify({'transactions': transactionsList}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        #Dodajemo admina ukoliko ne postoji
        if not Users.query.filter_by(email='admin@admin.com').first():
            initAdmin = Users(True,'Admin','Adminovic','Adminova 1', 'NS', 'SRB', '0','admin@admin.com','admin', True)
            db.session.add(initAdmin)
            db.session.commit()

        #Dodavanje svih ne izvrsenih transakcija u red za izvrsavanje
        transactions = Transactions.query.all()
        if transactions is not None:
            for trans in transactions:
                if not trans.isDone:
                    transactionQueue.append(trans.id)

    transactionThread = TransactionThread()
    transactionThread.start()

    app.run(port = 8000)
    
    transactionThread.join()