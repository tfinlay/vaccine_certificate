import {promises as fs} from 'fs'
import { decodeSignedCertificate, encodeCertificate, SignedVaccineCertificate, VaccinationStatus } from './common'
import { buildCertificate, generateKeypair, signCertificate } from './generator'
import { generateQrCode } from './presenter'
import { verifyCertificate } from './verifier'

(async () => {
    // Generate Keypair
    const {privateKey, publicKey} = generateKeypair()
    console.log(privateKey.export({
        type: 'pkcs1',
        format: 'pem'
    }))
    console.log(publicKey.export({
        type: 'pkcs1',
        format: 'pem'
    }))

    // Generate certificate
    const unsignedCert = await buildCertificate("Person ABCDEF GHIJKLMNOP", "./avatar.jpg", VaccinationStatus.FULLY_VACCINATED)

    const cert: SignedVaccineCertificate = signCertificate(unsignedCert, privateKey)

    console.log(cert)

    const data = encodeCertificate(cert)
    console.log(`Encoded to: ${data.toString("base64")}`)
    const decodedCert = decodeSignedCertificate(data)

    if (verifyCertificate(decodedCert, publicKey)) {
        console.log("Certificate Verified!")
    }
    else {
        console.log("Certificate verification failed.")
    }

    if (decodedCert.name === cert.name && decodedCert.imageData.equals(cert.imageData) && decodedCert.vaccinationStatus === cert.vaccinationStatus) {
        console.log("Certificates are identical.")
    }
    else {
        console.log("Certificates differ.")
    }

    // Write SignedCertificate out as a QR code.
    generateQrCode(cert, "cert.png")

    // Write picture out
    await fs.writeFile("qr_avatar.jpg", cert.imageData)
})().then(
    () => console.log("done."),
    (ex) => {
        throw ex
    }
)