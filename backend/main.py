from flask import request, jsonify
from config import app, db
from models import Contact, Company, Address
import pandas as pd
from flask_migrate import Migrate
migrate = Migrate(app, db)
from flasgger import Swagger


migrate = Migrate(app, db)

swagger = Swagger(app, template={
    "info": {
        "title": "Nikki's Contact Manager API",
        "description": "A RESTful API built with Flask for managing contacts and estimating salaries.",
        "version": "1.0.0"
    }
})

def estimate_salary_for_company(company, position):
    df = pd.read_csv('salary_data.csv')

    match = df[
        df['company'].str.lower().str.contains(company.lower())
        & df['position'].str.lower().str.contains(position.lower())
    ]

    if not match.empty:
        avg = match['avg_salary'].mean()
        return {'min': int(avg * 0.9), 'max': int(avg * 1.1)}
    else:
        return {'min': 60000, 'max': 90000}

@app.route("/contacts", methods=["GET"])
def get_contacts():
    """
    Get all contacts
    ---
    responses:
      200:
        description: A list of all contacts
        examples:
          application/json:
            contacts:
              - id: 1
                firstName: Nikki
                lastName: Yang
                email: y343yang@uwaterloo.ca
                company: Amazon
                position: Data Scientist
                salary: "110000 - 130000"
    """
    contacts = Contact.query.all()
    json_contacts = [c.to_json() for c in contacts]
    return jsonify({"contacts": json_contacts})


@app.route("/create_contact", methods=["POST"])
def create_contact():
    """
    Create a new contact
    ---
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - firstName
            - lastName
            - email
          properties:
            firstName:
              type: string
              example: Nikki
            lastName:
              type: string
              example: Yang
            email:
              type: string
              example: y343yang@uwaterloo.ca
            companyName:
              type: string
              example: Amazon
            position:
              type: string
              example: Software Engineer
    responses:
      201:
        description: Contact created successfully
    """
    data = request.json

    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    company_name = data.get("companyName")
    street = data.get("street")
    city = data.get("city")
    country = data.get("country")
    position = data.get("position") 

    if not first_name or not last_name or not email:
        return jsonify({"message": "You must include a first name, last name and email"}), 400

    company_id = None
    if company_name:
        company = Company.query.filter_by(name=company_name).first()
        if not company:
            company = Company(name=company_name, industry=None)
            db.session.add(company)
            db.session.commit()
        company_id = company.id

    salary_est = estimate_salary_for_company(company_name or "", position or "")
    salary = f"{salary_est['min']} - {salary_est['max']}"

    try:
        new_contact = Contact(
            first_name=first_name,
            last_name=last_name,
            email=email,
            company_id=company_id,
            position=position,
            salary=salary
        )
        db.session.add(new_contact)
        db.session.commit()

        if street and city and country:
            new_address = Address(
                street=street,
                city=city,
                country=country,
                contact_id=new_contact.id
            )
            db.session.add(new_address)
            db.session.commit()

    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    """
    Update an existing contact
    ---
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID of the contact to update
      - in: body
        name: body
        schema:
          type: object
          properties:
            email:
              type: string
            companyName:
              type: string
            position:
              type: string
    responses:
      200:
        description: Contact updated successfully
    """
    data = request.json
    print("DEBUG PATCH:", data)

    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404

    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)

    company_name = data.get("companyName")
    if company_name:
        company = Company.query.filter_by(name=company_name).first()
        if not company:
            company = Company(name=company_name, industry=None)
            db.session.add(company)
            db.session.commit()
        contact.company_id = company.id

    position = data.get("position")
    if position:
        contact.position = position
        salary_est = estimate_salary_for_company(company_name or "", position)
        contact.salary = f"{salary_est['min']} - {salary_est['max']}"
        print("UPDATED salary:", contact.salary)

    street = data.get("street")
    city = data.get("city")
    country = data.get("country")
    if street and city and country:
        if contact.address:
            contact.address.street = street
            contact.address.city = city
            contact.address.country = country
        else:
            new_address = Address(
                street=street,
                city=city,
                country=country,
                contact_id=contact.id
            )
            db.session.add(new_address)

    db.session.commit()
    return jsonify({"message": "User updated."}), 200


@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    """
    Delete a contact by ID
    ---
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID of the contact to delete
    responses:
      200:
        description: Contact deleted successfully
    """
    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404

    if contact.address:
        db.session.delete(contact.address)

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "User deleted!"}), 200


