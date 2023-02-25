const app = Vue.createApp({
  data() {
    return {
      address: '',
      message: ''
    }
  },
  methods: {
    async submitAddress() {
      if (!this.address) {
        this.message = 'Please enter an Ethereum address';
        return;
      }

      if (!ethers.utils.isAddress(this.address)) {
        this.message = 'Invalid Ethereum address';
        return;
      }

      // Check if the address already exists in the compromised addresses file
      try {
        const { data } = await axios.get('/api/compromised-addresses');
        const compromisedAddresses = data ? data : [];
        if (compromisedAddresses.some((entry) => entry.address.toLowerCase() === this.address.toLowerCase())) {
          this.message = 'This address has already been reported as compromised';
          return;
        }
      } catch (error) {
        console.error(error);
      }

      // Submit the new compromised address to the backend API
      try {
        const response = await axios.post('/api/compromised-addresses', { address: this.address });
        this.message = response.data.message;
      } catch (error) {
        console.error(error);
        this.message = 'Failed to submit compromised address';
      }
    }
  }
});

app.mount('#app');
