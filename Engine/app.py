from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://zeka:zeka@localhost:5432/testbaza'
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

    #Posto je primary_key id ce biti automatski kreiran
    def __init__(self, isAdmin, firstName, lastName, address, city, country, phoneNumber, email, password):
        self.isAdmin = isAdmin
        self.firstName = firstName
        self.lastName = lastName
        self.address = address
        self.city = city
        self.country = country
        self.phoneNumber = phoneNumber
        self.email =email
        self.password = password
    
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
            'password' : self.password
        }

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
                        recvEmail,recvPassword)
        db.session.add(newUser)
        db.session.commit()
        #TODO Napraviti slanje mejla novom useru sa njegovim kredencijalima
        return jsonify({'message': 'Novi korisnik uspesno napravljen!'}), 200
    else:
        return jsonify({'message': 'Email je vec u upotrebi!'}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        #Dodajemo admina ukoliko ne postoji
        if not Users.query.filter_by(email='admin@admin.com').first():
            initAdmin = Users(True,'Admin','Adminovic','Adminova 1', 'NS', 'SRB', '0','admin@admin.com','admin')
            db.session.add(initAdmin)
            db.session.commit()

    app.run(port = 6000)