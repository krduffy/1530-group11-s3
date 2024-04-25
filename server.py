import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs

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
    if username in database["userLoginData"] and database["userLoginData"][username] == password:
        return username
    else:
        return None

def get_user_data(username):
    database = read_database()
    if username in database["userFinancialData"]:
        return database["userFinancialData"][username]
    else:
        return None

def init_database():
    initial_database = {
      "userLoginData": {
        "username": "password",
      },
      "userFinancialData": {
        "username": [
          {
            "type": "Income",
            "amt": 2014.26,
            "source": "Paycheck"
          },
          {
            "type": "Expense",
            "amt": 25.00,
            "source": "Haircut"
          }
        ],
      }
    }
    write_database(initial_database)

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        if parsed_url.path.startswith("/userData"):
            # Extracting the username from the URL path
            # Assuming the path is in the format "/userData/username"
            path_parts = parsed_url.path.split("/")
            if len(path_parts) == 3:  # Expecting three parts: "", "userData", "username"
                username = path_parts[2]
                user_data = get_user_data(username)
                
                if user_data:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(user_data).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'User not found')
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Invalid URL format')
        elif parsed_url.path.endswith('.html'):
            try:
                with open(parsed_url.path[1:], 'rb') as file:
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    self.wfile.write(file.read())
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        elif parsed_url.path.endswith('.js'):
            try:
                with open(parsed_url.path[1:], 'rb') as file:
                    self.send_response(200)
                    self.send_header('Content-type', 'text/js')
                    self.end_headers()
                    self.wfile.write(file.read())
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        elif parsed_url.path.endswith('.css'):
            try:
                with open(parsed_url.path[1:], 'rb') as file:
                    self.send_response(200)
                    self.send_header('Content-type', 'text/css')
                    self.end_headers()
                    self.wfile.write(file.read())
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

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
                self.wfile.write(json.dumps({"message": "Login successful", "username": username}).encode('utf-8'))
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
