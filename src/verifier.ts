import crypto, { KeyObject } from "crypto"
import { encodeCertificate, SignedVaccineCertificate, VaccineCertificate } from "./common"

export const verifyCertificate = (cert: SignedVaccineCertificate, publicKey: KeyObject): boolean => {
    const unsignedCert = new VaccineCertificate({
        name: cert.name,
        imageData: cert.imageData,
        vaccinationStatus: cert.vaccinationStatus
    })

    return crypto.verify("sha256", encodeCertificate(unsignedCert), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    }, cert.signature)
}