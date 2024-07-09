import nodemailer from "nodemailer";
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);


const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.GMAIL_APP_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});


const sendMail = async function (mailType, email, fullName, OTP) {
  let subject, html;
  switch (mailType) {
    case "welcomeUser":
      subject = "Welcome to share learner",
        html = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title></title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }
    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
 
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
 
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
 
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
<img  style='width:90px; text-align: center; border-radius: 50%;'src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png' >
              <tr>
                <td style="padding:8px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  SHARE LEARNER
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Welcome, ${fullName}!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Thanks for choosing <b> share learner.</b> We are happy to see you on Dashboard.
                          Ready to level up your communication skills and increase your connection
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          To get started, verify by this OTP:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <p class="button" title="Login OTP" style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">${OTP}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          If you need some help and feel any problem contact us on our support team:<a href="mailto: sharelearner2024@gmail.com">support@gmail.com</a>

                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 8px;">
                          <a style="display: flex; justify-content: space-between; align-items: center; padding: 28px 24px; border-radius: 4px; background-color: #FFF9F9; text-decoration: none;" href="#">
                            <span style="width: 90%; font-size: 14px; line-height: 150%; font-weight: bold; color: #29426E; letter-spacing: 0.01em;">Get our new feature access</span>
                            <span style="width: 10%; float: right;">
                              <strong>→</strong>
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 60px;">
                          <a style="display: flex; padding: 28px 24px; border-radius: 4px; background-color: #FFF9F9; text-decoration: none;" href="#">
                            <span style="width: 90%; font-size: 14px; line-height: 150%; font-weight: bold; color: #29426E; letter-spacing: 0.01em;">Find your connection and post</span>
                            <span style="width: 10%; float: right;">
                              <strong>→</strong>
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                      <tr>
                        <td style="padding: 0 0 16px;">
                          <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;padding-left:0px"></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Best regards, <br>
                          <img  style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png
'>   
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                       <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color:purple;">SHARE LERANER<br/>kolaghat,Purba Medinipur,West Bengal,India</span>
                  </div>
                     </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`
      break;
    case "reset_password":
      subject = "Reset your password";
      html = `
   <!-- Change values in the template and pass { {variables} } with API call -->
<!-- Feel free to adjust it to your needs and delete all these comments-->
<!-- Also adapt TXT version of this email -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
  <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
<img  style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png' >
              <tr>
                <td style="padding:8px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  SHARE LEARNER
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Want to reset your password?
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Thanks for choosing <b> share learner.</b>
                          <br>
                          <br> We received a request to reset your password for your share learner account. 
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          To reset your password, verify this OTP:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <p class="button" title="Reset Password" style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">${OTP}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">

If you are not request to reset your paasword, please ignore this mail.
<br>
<br>
                          If you need some help and feel any problem contact us on our support team:<a href="mailto: sharelearner2024@gmail.com">support@gmail.com</a>

                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 8px;">
                          
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 60px;">
                         
                            
 </td>
                      </tr>
                      <tr>
                      <tr>
                        <td style="padding: 0 0 16px;">
                          <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;padding-left:0px"></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Best regards, <br>
                          <img  style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png'
>   
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color:purple;">SHARE LERANER<br/>kolaghat,Purba Medinipur,West Bengal,India</span>
                  </div>
                  <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>  
   `
      break;
    case "login_account":
      subject = "Login into share learner";
      html = `
     <!-- Change values in the template and pass { {variables} } with API call -->
<!-- Feel free to adjust it to your needs and delete all these comments-->
<!-- Also adapt TXT version of this email -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
  <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
<img  style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png' >
              <tr>
                <td style="padding:8px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  SHARE LEARNER
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                      Welcome  ${fullName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Thanks for choosing <b> share learner.</b>
                          <br>
                          <br>
     You are almost done !                     <br>  
     
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          To login in your account, use this OTP:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <p class="button" title="Reset Password" style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">${OTP}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">                          If you need some help and feel any problem contact us on our support team:<a href="mailto: sharelearner2024@gmail.com">support@gmail.com</a>

                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 8px;">
                          
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 60px;">
                         
                            
 </td>
                      </tr>
                      <tr>
                      <tr>
                        <td style="padding: 0 0 16px;">
                          <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;padding-left:0px"></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Best regards, <br>
                          <img  style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png'
>   
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color:purple;">SHARE LERANER<br/>kolaghat,Purba Medinipur,West Bengal,India</span>
                  </div>
                  <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>

     `
     break;
    case "changeEmail":
        subject=" change  your email for your Share Learner account";
        html=`
          <!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title></title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }
    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
         </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Welcome, ${fullName}!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Thanks for choosing <b> share learner.</b> We are happy to see you on Dashboard.
                          Ready to level up your communication skills and increase your connection
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          To get started, verify by this OTP:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <p class="button" title="Login OTP" style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">${OTP}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          If you need some help and feel any problem contact us on our support team:<a href="mailto: sharelearner2024@gmail.com">support@gmail.com</a>

                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 8px;">
                          <a style="display: flex; justify-content: space-between; align-items: center; padding: 28px 24px; border-radius: 4px; background-color: #FFF9F9; text-decoration: none;" href="#">
                            <span style="width: 90%; font-size: 14px; line-height: 150%; font-weight: bold; color: #29426E; letter-spacing: 0.01em;">Get our new feature access</span>
                            <span style="width: 10%; float: right;">
                              <strong>→</strong>
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 60px;">
                          <a style="display: flex; padding: 28px 24px; border-radius: 4px; background-color: #FFF9F9; text-decoration: none;" href="#">
                            <span style="width: 90%; font-size: 14px; line-height: 150%; font-weight: bold; color: #29426E; letter-spacing: 0.01em;">Find your connection and post</span>
                            <span style="width: 10%; float: right;">
                              <strong>→</strong>
                            </span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                      <tr>
                        <td style="padding: 0 0 16px;">
                          <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;padding-left:0px"></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Best regards, <br>
                          <img style='width:90px'src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png
'>   
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                       <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color:purple;">SHARE LERANER<br/>kolaghat,Purba Medinipur,West Bengal,India</span>
                  </div>
                     </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
 
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
 
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
 
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
<img style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png'>
              <tr>
                <td style="padding:8px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  SHARE LEARNER
                </td>
            <tr>
                      </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Want to change your Email?
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Thanks for choosing <b> share learner.</b>
                          <br>
                          <br> We received a request to reset your Email account for your share learner account. 
                        </td>
                      </tr>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <p class="button" title="Reset Password" style="width: 100%; background: #4C83EE; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">${OTP}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">

If you are not request to reset your email, please ignore this mail.
<br>
<br>
                          If you need some help and feel any problem contact us on our support team:<a href="mailto: sharelearner2024@gmail.com">support@gmail.com</a>

                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 8px;">
                          
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 60px;">
                         
                            
 </td>
                      </tr>
                      <tr>
                      <tr>
                        <td style="padding: 0 0 16px;">
                          <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;padding-left:0px"></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Best regards, <br>
                          <img style='width:90px; text-align: center; border-radius: 50%;' src='https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png'>
   
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]--><div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color:purple;">SHARE LEARNER<br/>Kolaghat,Purba Medinipur,West Bengal,India</span>
                  </div>
                  <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>      
             `
      break;
    default:
      subject = "Hello Learner";
      html = `
    <p> Welcome to share learner! This is your anothe communication world</p>
  `
      break;
  }

  // const { data, error } = await resend.emails.send({
  //   from: 'sharelearner <onboarding@resend.dev>',
  //   to: [email],
  //   subject: subject,
  //   html: html,
  // });

  // if (error) {
  //   console.log("error in sending Email",error);
  //   return false;
  // }

  // return true;

    
  const mailOptions = {
    from: {
      name: "sharelearner",
      address: process.env.GMAIL_APP_USER
    },
    to: email,
    subject: subject,
    html: html,  
  };

  transporter.sendMail(mailOptions,(err,info)=>{
    if (err) {
      console.log("error in sending Email",err);
      return false;
    } else {
      return true;
    }
  })
};

export { sendMail }
