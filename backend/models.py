from config import db


class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    industry = db.Column(db.String(120), nullable=True)

    contacts = db.relationship("Contact", backref="company", lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "industry": self.industry,
        }


class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False, nullable=False)
    last_name = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    position = db.Column(db.String(200), nullable=True)
    salary = db.Column(db.String(50), nullable=True)


    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), nullable=True)
    address = db.relationship("Address", uselist=False, backref="contact")

    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "company": self.company.to_json() if self.company else None,
            "address": self.address.to_json() if self.address else None,
            "position": self.position,
            "salary": self.salary
        }



class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)

    contact_id = db.Column(db.Integer, db.ForeignKey("contact.id"), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "street": self.street,
            "city": self.city,
            "country": self.country,
        }

address = db.relationship(
    "Address",
    uselist=False,
    backref="contact",
    cascade="all, delete-orphan"
)