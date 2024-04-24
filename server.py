import http.server
import socketserver
import json

# Define the path to your database file
database_path = "database.json"

def read_database():
    try:
        with open(database_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        # If the file doesn't exist, return an empty dictionary
        return {}

def write_database(data):
    with open(database_path, "w") as file:
        json.dump(data, file, indent=4)

def create_account(username, password):
    database = read_database()
    if username in database["userLoginData"]:
        return None
    else:
        database["userLoginData"][username] = password
        write_database(database)
        return username

def login(username, password):
    database = read_database()
    print(database)
    print(username)
    print(password)
    if username in database["userLoginData"] and database["userLoginData"][username] == password:
        return username
    else:
        return None

def init_database():
    initial_database = {
        "userLoginData": {},
        "userFinancialData": {}
    }
    write_database(initial_database)

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        post_data = json.loads(post_data)

        if self.path == "/createAccount":
            username = post_data["username"]
            password = post_data["password"]
            result = create_account(username, password)
            if result:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Account created successfully"}).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Username already exists"}).encode('utf-8'))

        elif self.path == "/login":
            username = post_data["username"]
            password = post_data["password"]
            result = login(username, password)
            if result:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Login successful"}).encode('utf-8'))
            else:
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

def run_server(port=8000):
    handler = SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving at port {port}")
        httpd.serve_forever()

# Run init_database to create the initial database
init_database()

# Run the server
run_server()
