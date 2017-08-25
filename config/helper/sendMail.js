import nodemailer from 'nodemailer';

const mailSender = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'alienyidavid4christ@gmail.com',
      pass: 'Davidwedomotola'
    }
  });
  const mailOptions = {
    from: 'fengshui-cfh <cardsforhumanity@fengshui-cfh.io>', // sender address
    to: req.body.invitee, // list of receivers
    subject: 'Cards For Humanity', // Subject line
    html: `
          <a href="http://fengshui-cfh-staging.herokuapp.com/#!/">
            <img style="display: block; margin: auto;"
              src="/css/cfh-bg.jpg"/>
          </a>
           <h2 style="margin-top: 40px; text-align: center">
           Cards For Humanity player,
           <span style="color: rgba(203, 109, 81, 0.9)">${req.body.gameOwner}</span>,
            has invited you to their game. <br><br>
              <a href="${req.body.url}">
                <div style="text-align: center">
                   <button style="background-color: red;
                    border: none; color: white; padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px; border-radius: 15px;">
                    CLICK HERE TO JOIN THE GAME
                   </button>
                 </div>
             </a> <br>
           </h2>
           <h3 style="text-align: center">
             You can also copy and paste the link below in your broswer <br>
             <span style="display: block; margin-top: 4px;
              background-color: #bec5ce; height: 30px; padding-top: 6px;
              text-align: center;">
               ${req.body.url}
             </span>
           </h3>
           `
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'An error occured'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  });
};

export default mailSender;
