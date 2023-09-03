const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const cors = require('cors');
const app = express();
const pdf = require('html-pdf');
const puppeteer = require('puppeteer');


const port = process.env.PORT || 3000;

// Use the cors middleware to enable CORS
app.use(cors());

app.use(bodyParser.json());

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the appropriate service (e.g., 'Outlook')
  auth: {
    user: 'dtkaccounnt@gmail.com',
    pass: 'uxeripijidfamvtj',
  },
});
// API endpoint to send emails
app.post('/api/send-single-emails', (req, res) => {
  const { recipient, subject, content } = req.body;

  const mailOptions = {
    from: 'dtkaccounnt@gmail.com', // Replace with your email
    to: recipient,
    subject: subject,
    text: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
     console.error('Error sending email:', error);
      res.status(200).json({ error: 'Email could not be sent.' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully.' });
    }
  });
});
// API endpoint to send the email
app.post('/api/send-email', async (req, res) => {
  try {

  const { shipper } = req.body;

  // Generate PDF
  const pdfBuffer = await generatePDF(shipper);

  // Send email
  const mailOptions = {
    from: 'dtkaccounnt@gmail.com',
    to: shipper.email,
    subject: 'Certificate of Shipment',
    text: 'Here is your certificate of shipment.',
    attachments: [
      {
        filename: 'certificate.pdf',
        content: pdfBuffer,
      },
    ],
  //   html: `
  //   <!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <title>Shipper Certificate</title>
  //     <style>
  //     body {
  //       font-family: Arial, sans-serif;
  //     }
  //     .certificate {
  //       max-width: 600px;
  //       margin: 0 auto;
  //       border: 2px solid #007bff;
  //       padding: 20px;
  //       text-align: center;
  //     }
  //     h1 {
  //       color: #007bff;
  //       margin-bottom: 10px;
  //     }
  //     p {
  //       margin: 10px 0;
  //     }
  //     .shipper-details {
  //       border-top: 1px solid #ccc;
  //       padding-top: 10px;
  //       margin-top: 20px;
  //       font-size: 0.9rem;
  //     }
  //     .signature {
  //       margin-top: 30px;
  //     }
  //     .signature-img {
  //       width: 150px;
  //       height: auto;
  //     }
  //     .footer {
  //       margin-top: 20px;
  //       font-size: 0.8rem;
  //       color: #666;
  //     }      </style>
  //   </head>
  //   <body>
  //     <div class="certificate">
  //       <h1>Certificate of Shipment</h1>
  //       <p>This is to certify that the shipment by the following shipper has been successfully completed:</p>
  //       <p><strong>Shipper Name:</strong> ${shipper.name}</p>
  //       <p><strong>Location:</strong> ${shipper.location}</p>
  //       <p><strong>Shipment Date:</strong> ${shipper.shipmentDate}</p>
  //       <div class="shipper-details">
  //         <p><strong>Shipment ID:</strong> ${shipper.shipmentID}</p>
  //         <p><strong>Goods:</strong> ${shipper.goods}</p>
  //         <p><strong>Carrier:</strong> ${shipper.carrier}</p>
  //       </div>
  //       <div class="signature">
  //         <img class="signature-img" src="signature.png" alt="Signature">
  //         <p>Authorized Signature</p>
  //       </div>
  //       <p class="footer">This certificate is issued on behalf of Example Shipping Company.</p>
  //     </div>
  //   </body>
  //   </html>
  // `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Email could not be sent.' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully.' });
    }
  });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'An error occurred.' });
}
});

// PDF generation function
// async function generatePDF(shipper) {
//   return new Promise((resolve, reject) => {
//     const pdfDoc = new PDFDocument();
//     const pdfBuffer = [];

//     pdfDoc.pipe(fs.createWriteStream('certificate.pdf'));

//   // Set font styles
//     pdfDoc.font('Helvetica-Bold');
//     pdfDoc.fontSize(18).text('Certificate of Shipment', { align: 'center' }).moveDown(0.5);

//     pdfDoc.font('Helvetica');
//     pdfDoc.fontSize(14).text(`Shipper Name: ${shipper.name}`).text(`Location: ${shipper.location}`);

//     pdfDoc.moveDown(0.5);
//     pdfDoc.fontSize(14).text(`Shipment ID: ${shipper.shipper_id}`).text(`Goods: ${shipper.goods}`);

//     // Set text color
//     pdfDoc.fillColor('#007bff');

//     pdfDoc.moveDown(1);
//     pdfDoc.fontSize(16).text('Authorized Signature', { align: 'center' });

//     // Reset text color
//     pdfDoc.fillColor('black');

//     pdfDoc.on('data', chunk => pdfBuffer.push(chunk));
//     pdfDoc.on('end', () => resolve(Buffer.concat(pdfBuffer)));

//     pdfDoc.end();
//   });
// }



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



async function generatePDF(shipper) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // const category = "gold";
  // Define your HTML template with styles
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipper Certificate</title>
    <style>
      html {
        -webkit-print-color-adjust: exact;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url(https://shippers.org.gh/wp-content/uploads/2023/09/${ shipper.category }.png);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh; /* Ensure the entire viewport is covered */
      }
      .certificate {
        width: 850px;
        height: 1100px;
        padding: 20px;
        text-align: center;
        color: black;
  
      }
  .year{
       top:857px;
       left:150px;
  }
  .month{
       top:830px;
       left:50px;
  }
  .day{
       top:808px;
       left:-95px;
  }
      .year, .month, .day {
        font-size: 1.3rem;
        position: relative;
       
      }
      .shipperName {
        font-size: 2.3rem;
        font-weight: 400;
        top:575px;
        position: relative;
       
      }
       .regdate {
        font-size: 1.3rem;
        top:870px;
        left:140px;
        position: relative;
      }
    </style>
  </head>
  <body>
    <div class="certificate">
  
      <div class="year">${new Date(shipper.reg_date).getFullYear().toString().slice(-2)}</div>
      <div class="month">${ new Date(shipper.reg_date).toLocaleString('en-US', { month: 'short' })}</div>
      <div class="day">${ new Date(shipper.reg_date).getDate()}</div>
      <div class="shipperName">${shipper.name}</div>
      <div class="regdate">${ shipper.reg_no }</div>
    </div>
  
  </body>
  </html>
  
  `;

  // Set the HTML content of the page
  await page.setContent(htmlTemplate);

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    margin: {
      top: '20px',
      bottom: '20px',
      left: '20px',
      right: '20px',
    },
    printBackground: true, // Important for background colors and images
  });

  // Close the browser
  await browser.close();

  return pdfBuffer;
}
