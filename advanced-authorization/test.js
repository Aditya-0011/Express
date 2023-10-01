import { createTransport } from "nodemailer"

const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth:{
        user: "aditya.219301222@muj.manipal.edu",
        pass: NsHmCPjXWOVq0dKT
    }
})

// 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