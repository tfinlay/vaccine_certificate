import crypto, { KeyObject } from "crypto"
import sharp from "sharp"
import { encodeCertificate, SignedVaccineCertificate, VaccinationStatus, VaccineCertificate } from "./common"

export const generateKeypair = () => {
    return crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048
    })
}

interface BuildCertificateOptions {
    image: {
        width?: number,
        height?: number,
        quality?: number,
        greyscale?: boolean
    }
}

/**
 * Builds a vaccine certificate, potentially throwing a variety of errors as it goes.
 * @param name Name of the person being issued the certificate.
 * @param imagePath String path to the image to attach to the certificate (for example, a passport photo). This will be resized and heavily compressed for QR-code friendliness.
 * @param vaccinationStatus Value describing the person's vaccination status
 * @param options @see BuildCertificateOptions
 */
export const buildCertificate = async (name: string, imagePath: string, vaccinationStatus: VaccinationStatus, options?: BuildCertificateOptions): Promise<VaccineCertificate> => {
    const {
        image: {
            width = 100,
            height = 100,
            greyscale = true,
            quality = 30
        }
    } = options ?? {
        image: {}
    }

    let sharpImage = sharp(imagePath)
        .resize({
            fit: 'contain',
            width,
            height
        })
        .removeAlpha()
    
    if (greyscale) {
        sharpImage = sharpImage
            .greyscale()
            .toColorspace('b-w')
    }

    const imageData = await sharpImage
        .jpeg({quality: quality})
        .toBuffer()
    
    return new VaccineCertificate({name, imageData, vaccinationStatus})
}

export const signCertificate = (cert: VaccineCertificate, privateKey: KeyObject): SignedVaccineCertificate => {
    const signature = crypto.sign("sha256", encodeCertificate(cert), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    })

    return new SignedVaccineCertificate({
        name: cert.name,
        imageData: cert.imageData,
        vaccinationStatus: cert.vaccinationStatus,
        signature
    })
}