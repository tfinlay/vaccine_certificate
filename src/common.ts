import { Field, Message, Type } from "protobufjs"
import zlib from "zlib"

export enum VaccinationStatus {
    UNVACCINATED = 0,
    PARTIAlLY_VACCINATED,
    FULLY_VACCINATED
}

export interface IVaccineCertificate {
    name: string,
    imageData: Buffer,
    vaccinationStatus: VaccinationStatus,
}
export interface ISignedVaccineCertificate extends IVaccineCertificate {
    signature: Buffer
}

@Type.d("VaccineCertificate")
export class VaccineCertificate extends Message<VaccineCertificate> implements IVaccineCertificate {
    @Field.d(1, "string", "required")
    public name: string

    @Field.d(2, "bytes", "required")
    public imageData: Buffer

    @Field.d(3, VaccinationStatus, "required")
    public vaccinationStatus: VaccinationStatus
}

@Type.d("SignedVaccineCertificate")
export class SignedVaccineCertificate extends Message<SignedVaccineCertificate> implements ISignedVaccineCertificate {
    @Field.d(1, "string", "required")
    public name: string

    @Field.d(2, "bytes", "required")
    public imageData: Buffer

    @Field.d(3, VaccinationStatus, "required")
    public vaccinationStatus: VaccinationStatus

    @Field.d(4, "bytes", "required")
    public signature: Buffer
}

const _baseEncodeCertificate = (cert: VaccineCertificate | SignedVaccineCertificate): Uint8Array => {
    if (cert instanceof SignedVaccineCertificate) {
        return SignedVaccineCertificate.encode(cert).finish()
    }
    else {
        return VaccineCertificate.encode(cert).finish()
    }
}

export const encodeCertificate = (cert: VaccineCertificate | SignedVaccineCertificate): Buffer => {
    return zlib.brotliCompressSync(
        Buffer.from(_baseEncodeCertificate(cert)),
        {
            params: [zlib.constants.BROTLI_PARAM_MODE, zlib.constants.BROTLI_MODE_GENERIC]
        }
    )
}

export const decodeSignedCertificate = (data: Buffer): SignedVaccineCertificate => {
    return SignedVaccineCertificate.decode(zlib.brotliDecompressSync(data))
}