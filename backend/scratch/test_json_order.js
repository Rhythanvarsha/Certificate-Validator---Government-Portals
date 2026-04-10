const cert1 = { 
    certificateId: '123', 
    name: 'Test', 
    certificateType: 'Degree', 
    issueDate: '2024-04-09' 
};

// Simulated retrieval from DB and reconstitution
const cert2 = {};
cert2.certificateId = '123';
cert2.name = 'Test';
cert2.certificateType = 'Degree';
cert2.issueDate = '2024-04-09';

console.log('Cert 1:', JSON.stringify(cert1));
console.log('Cert 2:', JSON.stringify(cert2));
console.log('Match:', JSON.stringify(cert1) === JSON.stringify(cert2));

const cert3 = {
    name: 'Test',
    certificateId: '123',
    issueDate: '2024-04-09',
    certificateType: 'Degree'
};
console.log('Cert 3 (different order):', JSON.stringify(cert3));
console.log('Match 1-3:', JSON.stringify(cert1) === JSON.stringify(cert3));
