import express from 'express';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import ip6 from 'ip6';

const router = express.Router();

router.post('/ipv6', (req, res) => {
    const { ipv6, prefixLength, newPrefixLength, subnetsCount } = req.body;

    try {
        // Calcula el rango completo de las subredes IPv6
        const startIPv6 = ip6.normalize(ipv6);
        const endIPv6 = ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[subnetsCount - 1]);

        // Calcula el tamaño total de la subred
        const size = BigInt(Math.pow(2, newPrefixLength - prefixLength));

        // Divide el rango completo en subredes según el número especificado
        const subnets = [];
        for (let i = 0; i < subnetsCount; i++) {
            const subnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i]));
            let subnetEnd;
            if (i === subnetsCount - 1) {
                subnetEnd = endIPv6;
            } else {
                const nextSubnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i + 1]));
                subnetEnd = nextSubnetStart;
            }
            subnets.push({
                value: `${subnetStart}/${newPrefixLength}`,
                ipRange: {
                    start: subnetStart,
                    end: subnetEnd
                },
                broadcastAddr: subnetEnd
            });
        }

        // Envia el resultado como respuesta
        res.json({ subnets });
    } catch (error) {
        // Si ocurre un error, envía un mensaje de error
        res.status(500).json({ error: error.message });
    }
});



router.post('/ipv6pdf', (req, res) => {
    const { ipv6, prefixLength, newPrefixLength, subnetsCount } = req.body;

    try {
        // Calcula el rango completo de las subredes IPv6
        const startIPv6 = ip6.normalize(ipv6);
        const endIPv6 = ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[subnetsCount - 1]);

        // Calcula el tamaño total de la subred
        const size = BigInt(Math.pow(2, newPrefixLength - prefixLength));

        // Divide el rango completo en subredes según el número especificado
        const subnets = {};
        for (let i = 0; i < subnetsCount; i++) {
            const subnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i]));
            let subnetEnd;
            if (i === subnetsCount - 1) {
                subnetEnd = endIPv6;
            } else {
                const nextSubnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i + 1]));
                subnetEnd = nextSubnetStart;
            }
            subnets[`subred${i + 1}`] = [{
                value: `${subnetStart}/${newPrefixLength}`,
                ipRange: {
                    start: subnetStart,
                    end: subnetEnd
                },
                broadcastAddr: subnetEnd
            }];
        }

        // Genera un PDF con la información de las subredes
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream('ipv6_subnets.pdf');
        doc.pipe(writeStream);

        // Añade la información de las subredes al PDF
        doc.text('IPv6 Subnets Report', { align: 'center' }).moveDown(0.5);
        doc.text('Proyecto de redes y comunicaciones', { align: 'center' }).moveDown(0.5);
        doc.text('UPC-2024-1', { align: 'center' }).moveDown(0.5);
        doc.text(`IPv6: ${ipv6}`).moveDown(0.5);;
        doc.text(`Prefijo actual: ${prefixLength}`).moveDown(0.5);
        doc.text(`Nuevo prefijo: ${newPrefixLength}`).moveDown(0.5);
        doc.text(`Numero de subredes: ${subnetsCount}`).moveDown(1);
        doc.text('Informacion de subredes:', { underline: true }).moveDown(0.5);

        for (let i = 1; i <= subnetsCount; i++) {
            const subnet = subnets[`subred${i}`][0];
            doc.text(`Subnet ${i}:`);
            doc.text(`Value: ${subnet.value}`);
            doc.text(`IP Range: ${subnet.ipRange.start} - ${subnet.ipRange.end}`);
            doc.text(`Broadcast Address: ${subnet.broadcastAddr}`).moveDown(0.5);
        }

        // Finaliza el PDF y cierra el stream de escritura
        doc.end();
        writeStream.on('finish', () => {
            console.log('PDF creado exitosamente');
            res.status(200).download('ipv6_subnets.pdf');
        });

    } catch (error) {
        // Si ocurre un error, envía un mensaje de error
        res.status(500).json({ error: error.message });
    }
});


router.post('/ipv6excel', (req, res) => {
    const { ipv6, prefixLength, newPrefixLength, subnetsCount } = req.body;

    try {
        // Calcula el rango completo de las subredes IPv6
        const startIPv6 = ip6.normalize(ipv6);
        const endIPv6 = ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[subnetsCount - 1]);

        // Calcula el tamaño total de la subred
        const size = BigInt(Math.pow(2, newPrefixLength - prefixLength));

        // Divide el rango completo en subredes según el número especificado
        const subnets = {};
        for (let i = 0; i < subnetsCount; i++) {
            const subnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i]));
            let subnetEnd;
            if (i === subnetsCount - 1) {
                subnetEnd = endIPv6;
            } else {
                const nextSubnetStart = ip6.normalize(ip6.abbreviate(ip6.divideSubnet(startIPv6, prefixLength, newPrefixLength, subnetsCount, true)[i + 1]));
                subnetEnd = nextSubnetStart;
            }
            subnets[`subred${i + 1}`] = [{
                value: `${subnetStart}/${newPrefixLength}`,
                ipRange: {
                    start: subnetStart,
                    end: subnetEnd
                },
                broadcastAddr: subnetEnd
            }];
        }

        // Crear un nuevo libro de trabajo de Excel
        const workbook = XLSX.utils.book_new();

        // Crear una nueva hoja de cálculo
        const worksheet = XLSX.utils.json_to_sheet([
            { ipv6: ipv6 },
            { "Prefijo actual": prefixLength },
            { "Nuevo prefijo": newPrefixLength },
            { "Número de subredes": subnetsCount },
            {}
        ]);

        // Agregar la información de las subredes a la hoja de cálculo
        for (let i = 1; i <= subnetsCount; i++) {
            const subnet = subnets[`subred${i}`][0];
            XLSX.utils.sheet_add_json(worksheet, [
                { [`Subnet ${i}`]: null },
                { "Value": subnet.value },
                { "IP Range": `${subnet.ipRange.start} - ${subnet.ipRange.end}` },
                { "Broadcast Address": subnet.broadcastAddr },
                {}
            ], { origin: -1 });
        }

        // Agregar la hoja de cálculo al libro de trabajo
        XLSX.utils.book_append_sheet(workbook, worksheet, 'IPv6 Subnets');

        // Escribir el libro de trabajo en un archivo XLSX
        const filePath = 'ipv6_subnets.xlsx';
        XLSX.writeFile(workbook, filePath);

        // Enviar el archivo XLSX como respuesta
        res.status(200).download(filePath, () => {
            // Eliminar el archivo después de que se haya enviado
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        // Si ocurre un error, enviar un mensaje de error
        res.status(500).json({ error: error.message });
    }
});

export default router;