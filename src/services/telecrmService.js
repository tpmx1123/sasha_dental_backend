const https = require('https');

class TeleCRMService {
  constructor() {
    this.apiUrl = process.env.TELECRM_API_URL || 'https://next-api.telecrm.in';
    this.enterpriseId = process.env.TELECRM_ENTERPRISE_ID;
    this.apiToken = process.env.TELECRM_API_TOKEN;
  }

  /**
   * Format phone number to international format (+91XXXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
      return phone;
    }

    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.trim().replace(/[\s\-()]/g, '');

    // If already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // If starts with 91 and has 12+ digits, add +
    if (cleaned.startsWith('91') && cleaned.length >= 12) {
      return '+' + cleaned;
    }

    // If starts with 0, replace with +91
    if (cleaned.startsWith('0')) {
      return '+91' + cleaned.substring(1);
    }

    // If 10 digits, add +91
    if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
      return '+91' + cleaned;
    }

    // If all digits, assume Indian number and add +91
    if (/^\d+$/.test(cleaned)) {
      return '+91' + cleaned;
    }

    // Return original if can't format
    return phone;
  }

  /**
   * Format appointment date and time to TeleCRM format (dd/MM/yyyy HH:mm:ss)
   */
  formatAppointmentDateTime(preferredDate, preferredTime) {
    try {
      const date = new Date(preferredDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      // Format time (preferredTime is in HH:MM format)
      const time = preferredTime || '09:00';
      const [hours, minutes] = time.split(':');

      return `${day}/${month}/${year} ${hours}:${minutes}:00`;
    } catch (error) {
      console.error('Error formatting appointment date/time:', error);
      // Return current date/time as fallback
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:00`;
    }
  }

  /**
   * Map dental service name to TeleCRM client concerns
   * Update these mappings to match your TeleCRM dropdown values exactly
   */
  mapServiceToClientConcerns(serviceName) {
    if (!serviceName || typeof serviceName !== 'string') {
      return null;
    }
  
    const serviceLower = serviceName.toLowerCase().trim();
  
    // Service mappings - MATCHES TELECRM DROPDOWN VALUES (Dental-[Service] format)
    const serviceMapping = {
      // Dental Restorations & Fillings
      'dental restorations & fillings': 'Dental-Restorations & Fillings',
      'dental fillings & restorations': 'Dental-Restorations & Fillings',
      'dental fillings': 'Dental-Restorations & Fillings',
      'restorations': 'Dental-Restorations & Fillings',
      'fillings': 'Dental-Restorations & Fillings',
      
      // Dental Crowns & Veneers
      'dental crowns & veneers': 'Dental-Crowns & Veneers',
      'crowns & veneers': 'Dental-Crowns & Veneers',
      'dental crowns': 'Dental-Crowns & Veneers',
      'veneers': 'Dental-Crowns & Veneers',
      
      // Orthodontic Solutions
      'orthodontic solutions': 'Dental-Orthodontic Solutions',
      'orthodontics': 'Dental-Orthodontic Solutions',
      'orthodontic treatments': 'Dental-Orthodontic Solutions',
      'braces & aligners': 'Dental-Orthodontic Solutions',
      'braces': 'Dental-Orthodontic Solutions',
      'aligners': 'Dental-Orthodontic Solutions',
      
      // Oral Prophylaxis
      'oral prophylaxis': 'Dental-Oral Prophylaxis',
      'scaling & oral prophylaxis': 'Dental-Oral Prophylaxis',
      'scaling': 'Dental-Oral Prophylaxis',
      'cleaning': 'Dental-Oral Prophylaxis',
      
      // Tooth Extractions
      'tooth extractions': 'Dental-Tooth Extractions',
      'tooth extraction': 'Dental-Tooth Extractions',
      'extractions': 'Dental-Tooth Extractions',
      'extraction': 'Dental-Tooth Extractions',
      
      // Root Canal
      'root canal': 'Dental-Root Canal',
      'root canal treatment': 'Dental-Root Canal',
      'rct': 'Dental-Root Canal',
      
      // Flap Surgery
      'flap surgery': 'Dental-Flap Surgery',
      'periodontal flap surgery': 'Dental-Flap Surgery',
      
      // Tooth-Specific Minor Surgical Care
      'tooth-specific minor surgical care': 'Dental-Tooth-Specific Minor Surgical Care',
      'tooth surgery': 'Dental-Tooth-Specific Minor Surgical Care',
      'minor surgical care': 'Dental-Tooth-Specific Minor Surgical Care',
      'surgical care': 'Dental-Tooth-Specific Minor Surgical Care',
      
      // Teeth Whitening
      'teeth whitening': 'Dental-Teeth Whitening',
      'tooth whitening': 'Dental-Teeth Whitening',
      'whitening': 'Dental-Teeth Whitening',
      'bleaching': 'Dental-Teeth Whitening',
      
      // Dental Implants
      'dental implants': 'Dental-Dental Implants',
      'implants': 'Dental-Dental Implants',
      'dental implant': 'Dental-Dental Implants',
      'implant': 'Dental-Dental Implants',
      
      // Laser Gum Treatments
      'laser gum treatments': 'Dental-Laser Gum Treatments',
      'laser gum': 'Dental-Laser Gum Treatments',
      'laser gum treatment': 'Dental-Laser Gum Treatments',
      'gum treatment': 'Dental-Laser Gum Treatments',
      'periodontics': 'Dental-Laser Gum Treatments',
      'gum & bone care': 'Dental-Laser Gum Treatments'
    };
  
    // Check for exact match
    if (serviceMapping[serviceLower]) {
      return serviceMapping[serviceLower];
    }
  
    // Check for partial match
    for (const [key, value] of Object.entries(serviceMapping)) {
      if (serviceLower.includes(key) || key.includes(serviceLower)) {
        return value;
      }
    }
  
    // If no match, format with "Dental-" prefix
    const formatted = this.formatServiceName(serviceName);
    return `Dental-${formatted}`;
  }

  /**
   * Format service name to title case
   */
  formatServiceName(serviceName) {
    if (!serviceName || typeof serviceName !== 'string') {
      return serviceName;
    }

    return serviceName
      .split(/[\s&-]/)
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Make HTTP POST request to TeleCRM API
   */
  async makeRequest(url, payload) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const data = JSON.stringify(payload);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = responseData ? JSON.parse(responseData) : {};
              resolve({ success: true, statusCode: res.statusCode, data: parsed });
            } catch (e) {
              resolve({ success: true, statusCode: res.statusCode, data: responseData });
            }
          } else {
            reject(new Error(`TeleCRM API returned status ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Create a lead in TeleCRM from an appointment
   */
  async createLead(appointment) {
    console.log('🔵 TeleCRM createLead called for appointment:', appointment.fullName);

    // Validate configuration
    if (!this.apiToken || this.apiToken.trim() === '') {
      console.error('❌ TELECRM_API_TOKEN is not set or is empty!');
      return { success: false, error: 'TeleCRM API token not configured' };
    }

    if (!this.enterpriseId || this.enterpriseId.trim() === '') {
      console.error('❌ TELECRM_ENTERPRISE_ID is not set or is empty!');
      return { success: false, error: 'TeleCRM Enterprise ID not configured' };
    }

    try {
      const url = `${this.apiUrl}/enterprise/${this.enterpriseId}/autoupdatelead`;
      
      // Format date for TeleCRM
      const appointmentDateTime = this.formatAppointmentDateTime(
        appointment.preferredDate,
        appointment.preferredTime
      );

      // Build payload
      const payload = {
        fields: {
          name: appointment.fullName,
          phone: this.formatPhoneNumber(appointment.phone),
          email: appointment.email,
          appointment_date_and_time: appointmentDateTime,
          lead_source: process.env.TELECRM_LEAD_SOURCE || 'SashaDental-webform'
        }
      };

      // Add message/note if available
      if (appointment.message && appointment.message.trim() !== '') {
        payload.fields.note = appointment.message.trim();
      }

      // Map service to client concerns
      if (appointment.service) {
        const clientConcerns = this.mapServiceToClientConcerns(appointment.service);
        if (clientConcerns) {
          payload.fields.client_concerns = clientConcerns;
        }
      }

      // Make API request
      const response = await this.makeRequest(url, payload);

      if (response.success) {
        console.log(`✅ TeleCRM lead created successfully for: ${appointment.fullName}`);
        return { success: true, response };
      } else {
        console.error('⚠️ TeleCRM API returned unsuccessful response');
        return { success: false, error: 'Unsuccessful response from TeleCRM' };
      }
    } catch (error) {
      console.error('❌ Failed to send lead to TeleCRM:', error.message);
      console.error('Error details:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TeleCRMService();

