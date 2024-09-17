const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/send-email', (req, res) => {
  const name = req.body.name;
  const receiver_email = req.body.email;
  const fileName = req.body.filename;
  console.log(fileName);


//   const message = req.body.message;

  const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port : 465,
    auth: {
      user: 'naanu9110@gmail.com', // Replace with your email address
      pass: 'wsencnhgsoasxpqa' // Replace with your email password
    }
  });




    const mailOptions = {
      // from: 'sender@email.com', // sender address
      to: receiver_email, // list of receivers
      subject: 'New invoice from Retail Store from angular', // Subject line
      html: `Hello ${name},<br>
      Please find the attached Invoice with this email.<br>
            <br>
      Thank you for shopping,
      Retail Store`,// plain text body
      attachments : [
        {
          filename : fileName,
          path: 'C:/Users/srk/Downloads/' + fileName 
        }
      ]
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        // console.log(err)
      res.status(404).send(err);
      else
        // console.log(info);
      res.status(200).send({message : "Email sent successfully"});
    });

  });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});