import os
import json
import hmac
import hashlib
import urllib.request
import urllib.parse
from time import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

config = {
    "appid": int(os.getenv("APP_ID", "553")),
    "key1": os.getenv("KEY1", ""),
    "key2": os.getenv("KEY2", ""),
    "endpoint": "https://sandbox.zalopay.com.vn/v001/tpe/createorder"
}

def create_zalopay_order(amount: int, items: list, receipt_id: int, customer_name: str = "Customer", redirect_url: str = None, bank_code: str = "", callback_url: str = None):
    # apptransid must be yyMMdd_xxxx
    app_trans_id = "{:%y%m%d}_{}".format(datetime.today(), receipt_id)
    
    embed_data = { 
        "merchantinfo": "cinema_booking",
        "receipt_id": receipt_id
    }
    if redirect_url:
        embed_data["redirecturl"] = redirect_url

    order = {
        "appid": config["appid"],
        "apptransid": app_trans_id,
        "appuser": customer_name,
        "apptime": int(round(time() * 1000)), # miliseconds
        "embeddata": json.dumps(embed_data),
        "item": json.dumps(items),
        "amount": amount,
        "description": f"Cinema Booking #{receipt_id}",
        "bankcode": bank_code
    }
    if callback_url:
        order["callbackurl"] = callback_url

    # appid|apptransid|appuser|amount|apptime|embeddata|item
    data = "{}|{}|{}|{}|{}|{}|{}".format(
        order["appid"], order["apptransid"], order["appuser"], 
        order["amount"], order["apptime"], order["embeddata"], order["item"]
    )

    order["mac"] = hmac.new(config['key1'].encode(), data.encode(), hashlib.sha256).hexdigest()

    try:
        response = urllib.request.urlopen(url=config["endpoint"], data=urllib.parse.urlencode(order).encode())
        result = json.loads(response.read())
        return result
    except Exception as e:
        return {"returncode": -1, "returnmessage": str(e)}

def query_zalopay_order(app_trans_id: str):
    params = {
        "appid": config["appid"],
        "apptransid": app_trans_id
    }
    
    # mac = appid|apptransid|key1
    data = "{}|{}|{}".format(params["appid"], params["apptransid"], config["key1"])
    params["mac"] = hmac.new(config['key1'].encode(), data.encode(), hashlib.sha256).hexdigest()

    url = "https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid"
    
    try:
        response = urllib.request.urlopen(url=url, data=urllib.parse.urlencode(params).encode())
        result = json.loads(response.read())
        return result
    except Exception as e:
        return {"returncode": -1, "returnmessage": str(e)}