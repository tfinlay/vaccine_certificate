import QRCode from "qrcode";
import { encodeCertificate, SignedVaccineCertificate } from "./common";

export const generateQrCode = async (certificate: SignedVaccineCertificate, outPath: string): Promise<void> => {
    return QRCode.toFile(outPath, [
        // @ts-ignore
        {data: encodeCertificate(certificate), mode: 'byte'}
    ])
}