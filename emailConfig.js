import axios from "axios";

const emailjsUserID = '9x9NJFyX4_NISPyvO';
const serviceID = 'service_dkzztme';
const templateID = 'template_3gnp5sa';

const sendEmail = async (emailParams) => {
  const url = `https://api.emailjs.com/api/v1.0/email/send`;

  const emailData = {
    service_id: serviceID,
    template_id: templateID,
    user_id: emailjsUserID,
    template_params: emailParams
  };

  try {
    const response = await axios.post(url, emailData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Use default export syntax
export default sendEmail;