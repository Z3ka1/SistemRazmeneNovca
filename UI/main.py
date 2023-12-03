from flask import Flask, render_template, request, session, json
import requests

app = Flask(__name__)
app.secret_key = "qwersafargadfsgwabgxbvsdb"

@app.route("/")
def home():
    return render_template("index.html")

#Ne potrebno?
@app.route("/registrationView")
def registrationView():
    return render_template("registracija.html")

@app.route("/register", methods=['POST', 'GET'])
def register():
    if request.method == 'GET':
        return render_template('registracija.html')
    elif request.method == 'POST':
        ime = request.form['firstName']
        prezime = request.form['lastName']
        adresa = request.form['address']
        grad = request.form['city']
        drzava = request.form['country']
        telefon = request.form['phoneNumber']
        email = request.form['email']
        lozinka = request.form['password']

    #TODO (POSLATI MAIL U ENGINEu)
    headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
    data = {'firstName':ime, 'lastName':prezime, 'address': adresa, 'city': grad, 'country': drzava,
            'phoneNumber' : telefon, 'email': email, 'password': lozinka}
    requ = requests.post("http://localhost:6000/registerUser", json = data, headers = headers)
    response = requ.json()
    statusCode = requ.status_code
    respMessage = response['message']


    return render_template('registracija.html', message = respMessage)
    
@app.route("/login", methods=['POST', 'GET'])
def login():
    if request.method == 'GET':
        return render_template('index.html')
    elif request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
    
    #slanje JSON objekta engine-u
    headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
    data = {'email': email, 'password': password}

    requ = requests.post("http://localhost:6000/returnUser", json=data, headers=headers)
    response = requ.json()

    statusCode = requ.status_code
    respMessage = response['message']

    #U zavisnosti od odgovora sa servera odredjujemo dalje korake
    if statusCode == 200:
        foundUser = response['user']
        session['user'] = foundUser
        return render_template('index.html', message = respMessage)
    else:
        return render_template('index.html', message = respMessage)

@app.route("/logout")
def logout():
    session.pop('user', None)
    return render_template('index.html')

if __name__ == "__main__":
    app.run(port = 5000)