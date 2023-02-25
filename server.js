//require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const ethers = require('@ethersproject/address');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const COMPROMISED_ADDRESSES_PATH = path.join(__dirname, 'compromised.json');

app.post('/api/compromised-addresses', async (req, res) => {
  const { address } = req.body;

  // Validate the Ethereum address
  if (!ethers.isAddress(address)) {
    res.status(400).json({
      message: 'Invalid Ethereum address'
    });
    return;
  }

  // Check if the address already exists in the compromised addresses file
  try {
    const contents = await fs.readFile(COMPROMISED_ADDRESSES_PATH, 'utf-8');
    const compromisedAddresses = JSON.parse(contents || '[]');
    if (compromisedAddresses.some((entry) => entry.address.toLowerCase() === address.toLowerCase())) {
      res.status(400).json({
        message: 'This address has already been reported as compromised'
      });
      return;
    }
  } catch (error) {
    console.error(error);
  }

  // Add the new compromised address to the compromised addresses file
  const newCompromisedAddress = {
    address,
    date: new Date().toISOString()
  };
  try {
    const contents = await fs.readFile(COMPROMISED_ADDRESSES_PATH, 'utf-8');
    const compromisedAddresses = JSON.parse(contents || '[]');
    compromisedAddresses.push(newCompromisedAddress);
    await fs.writeFile(COMPROMISED_ADDRESSES_PATH, JSON.stringify(compromisedAddresses, null, 2), 'utf-8');
    res.json({
      message: 'Compromised address added successfully',
      compromisedAddress: newCompromisedAddress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to add compromised address'
    });
  }
});

app.get('/api/compromised-addresses', async (req, res) => {
  try {
    const contents = await fs.readFile(COMPROMISED_ADDRESSES_PATH, 'utf-8');
    const compromisedAddresses = JSON.parse(contents || '[]');
    res.json(compromisedAddresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to retrieve compromised addresses'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
