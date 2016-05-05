import request from 'request';
import moment from 'moment';
import uuid from 'node-uuid';
import EncryptedPassword from './encrypt';
import ParseResponse from './parse-response';


export default class CheckOutRequest {
  static constructSOAPBody(data) {
    data.timeStamp = moment().format('Y-m-d H:m:s');
    data.encryptedPassword = new EncryptedPassword(data.timeStamp);
    data.merchantTransactionID = new Buffer(uuid.v1()).toString('base64'); // time-based
    // data.referenceID // Product, service or order ID

    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="tns:ns">
      <soapenv:Header>
        <tns:CheckOutHeader>
          <MERCHANT_ID>${process.env.PAYBILL_NUMBER}</MERCHANT_ID>
          <PASSWORD>${data.encryptedPassword}</PASSWORD>
          <TIMESTAMP>${data.timeStamp}</TIMESTAMP>
        </tns:CheckOutHeader>
      </soapenv:Header>
      <soapenv:Body>
        <tns:processCheckOutRequest>
          <MERCHANT_TRANSACTION_ID>${data.merchantTransactionID}</MERCHANT_TRANSACTION_ID>
          <REFERENCE_ID>${data.referenceID}</REFERENCE_ID>
          <AMOUNT>${data.amountInDoubleFloat}</AMOUNT>
          <MSISDN>${data.clientPhoneNumber}</MSISDN>
          <ENC_PARAMS>${(data.extraMerchantPayload || '')}</ENC_PARAMS>
          <CALL_BACK_URL>${process.env.CALLBACK_URL}</CALL_BACK_URL>
          <CALL_BACK_METHOD>${process.env.CALLBACK_METHOD}</CALL_BACK_METHOD>
          <TIMESTAMP>${data.timeStamp}</TIMESTAMP>
        </tns:processCheckOutRequest>
      </soapenv:Body>
    </soapenv:Envelope>`;
  }

  static send(soapBody) {
    return new Promise((resolve, reject) => {
      request({
        'method': 'POST',
        'uri': process.env.ENDPOINT,
        'rejectUnauthorized': false,
        'body': soapBody,
        'headers': {
          'content-type': 'application/xml; charset=utf-8',
        },
      }, (err, response, body) => {
        if (err) {
          err = new Error(err);
          err.status = 503;
          reject(err);
          return;
        }
        if (response.statusCode == 200) {
          let parsed = new ParseResponse(body);
          resolve(parsed.toJSON());
        }
      });
    });
  }
}

// Please note:
// encryptedPassword = base64_encode(CAPITALISE(hash('sha256', $MERCHANT_ID + $passkey + $TIMESTAMP)));