
import re
import ipaddress


# Check whether a card number passes the Luhn algorithm
def is_valid_card_number(number):

    digits = [int(digit) for digit in number if digit.isdigit()]

    if not 13 <= len(digits) <= 19:
        return False

    total = 0
    reverse_digits = digits[::-1]

    for index, digit in enumerate(reverse_digits):

        if index % 2 == 1:
            digit *= 2

            if digit > 9:
                digit -= 9

        total += digit

    return total % 10 == 0


# Check whether an IPv4 address is valid
def is_valid_ip(address):

    try:
        ipaddress.IPv4Address(address)
        return True

    except ValueError:
        return False


# Main detection function
def scan_text(text):

    patterns = {

        "Email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',

        "Aadhaar-like Number": r'(?<!\d)(?:\d{4}[\s-]?){2}\d{4}(?!\d)',

        "Phone Number": r'(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)',

        "PAN Number": r'\b[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]\b',

        "IPv4 Address": r'(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])',

        "Credit/Debit Card Number": r'(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)'

    }

    matches = []

    # Find sensitive information
    for category, pattern in patterns.items():

        for match in re.finditer(pattern, text, re.IGNORECASE):

            value = match.group()

            # Validate IPv4 addresses
            if category == "IPv4 Address":

                if not is_valid_ip(value):
                    continue

            # Validate card numbers using Luhn algorithm
            elif category == "Credit/Debit Card Number":

                if not is_valid_card_number(value):
                    continue

            matches.append({
                "category": category,
                "value": value,
                "start": match.start(),
                "end": match.end()
            })


    # Sort matches by position and prefer longer matches
    matches.sort(
        key=lambda item: (item["start"], -(item["end"] - item["start"]))
    )


    # Avoid overlapping detections
    valid_matches = []
    last_end = 0

    for item in matches:

        if item["start"] >= last_end:

            valid_matches.append(item)
            last_end = item["end"]


    # Replacement labels
    replacements = {

        "Email": "[EMAIL HIDDEN]",

        "Aadhaar-like Number": "[AADHAAR NUMBER HIDDEN]",

        "Phone Number": "[PHONE NUMBER HIDDEN]",

        "PAN Number": "[PAN NUMBER HIDDEN]",

        "IPv4 Address": "[IP ADDRESS HIDDEN]",

        "Credit/Debit Card Number": "[CARD NUMBER HIDDEN]"

    }


    # Create protected text
    redacted_text = ""
    last_end = 0
    detections = []

    for item in valid_matches:

        redacted_text += text[last_end:item["start"]]

        redacted_text += replacements[item["category"]]

        last_end = item["end"]

        detections.append({
            "category": item["category"],
            "value": item["value"]
        })


    redacted_text += text[last_end:]


    return {
        "detections": detections,
        "total": len(detections),
        "redacted_text": redacted_text
    }
