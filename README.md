# Vaccine Passport

This is a basic vaccine passport creation and validation system using QR codes and an RSA signature to verify legitimacy.

Each QR Code contains an encoding of a 'Vaccine Certificate'. Each certificate contains the following data:
* Name
* Image (e.g. a passport photo)
    * Heavily compressed and greyscale to fit inside a scannable QR code.
* Vaccination Status (one of 'Unvaccinated', 'Partially Vaccinated' and 'Fully Vaccinated')
* Signature (RSA signature of the other fields)

The process to create a certificate QR code is as follows (assuming an RSA keypair already exists):
1. Build an unsigned `VaccineCertificate`. The image goes through the following pre-processing steps:
    1. Resize (maintaining aspect ratio) to 100x100px.
    2. Remove the alpha channel (if any).
    3. Convert to greyscale and black/white colourspace.
    4. Save to `Buffer` in WebP format with quality = 30.
2. Sign the `VaccineCertificate`, producing a `SignedVaccineCertificate`.
2. Pack `SignedVaccineCertificate` into a `Buffer` using Protobuf.
3. Compress the `Buffer` using brotli.
4. Encoded the `Buffer` into a QR code.

The decoding process is the exact reverse of steps 2-4.

## Usage

See [cli.ts](src/cli.ts) for a complete usage example.

## License

See [LICENSE](LICENSE)
