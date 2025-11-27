# TeleCRM Integration Guide

Complete guide for integrating TeleCRM API into your Node.js/Express application.

## Overview

TeleCRM integration automatically creates leads in TeleCRM whenever an appointment is created. It's a fire-and-forget process - appointments succeed even if TeleCRM fails, ensuring your booking system remains reliable.

## Prerequisites

1. Node.js/Express Application
2. TeleCRM Account with API access
3. TeleCRM Enterprise ID
4. TeleCRM API Token

## Step 1: Configuration

Add to your `.env` file:

```env
# TeleCRM Configuration
TELECRM_API_URL=https://next-api.telecrm.in
TELECRM_ENTERPRISE_ID=YOUR_ENTERPRISE_ID_HERE
TELECRM_API_TOKEN=your_api_token_here
TELECRM_LEAD_SOURCE=sashasmiles.com
```

### Getting Your TeleCRM Credentials

1. **Enterprise ID**: Found in your TeleCRM dashboard settings
2. **API Token**: Generate from your TeleCRM account settings
3. **Lead Source**: Optional - identifier for where leads come from (defaults to "sashasmiles.com")

## Step 2: Service Implementation

The TeleCRM service is already created at `src/services/telecrmService.js`. It includes:

- ✅ Automatic phone number formatting (Indian format: +91XXXXXXXXXX)
- ✅ Date/time formatting for TeleCRM (dd/MM/yyyy HH:mm:ss)
- ✅ Service name mapping to client concerns
- ✅ Error handling and logging
- ✅ Fire-and-forget integration (doesn't block appointment creation)

## Step 3: Integration

The service is already integrated into `src/controllers/appointmentController.js`. When an appointment is created:

1. Appointment is saved to MongoDB
2. Confirmation email is sent to patient (existing functionality)
3. Notification email is sent to admin (existing functionality)
4. **Lead is sent to TeleCRM** (new functionality)

All steps are independent - if one fails, others still succeed.

## Step 4: Service Mappings

Update the service mappings in `src/services/telecrmService.js` to match your TeleCRM dropdown values exactly.

Current mappings in `mapServiceToClientConcerns()`:

```javascript
const serviceMapping = {
  'dental restorations & fillings': 'Dental Restorations & Fillings',
  'dental crowns & veneers': 'Dental Crowns & Veneers',
  'orthodontic solutions': 'Orthodontic Solutions',
  'oral prophylaxis': 'Oral Prophylaxis',
  'tooth extractions': 'Tooth Extractions',
  'root canal': 'Root Canal',
  'flap surgery': 'Flap Surgery',
  'tooth-specific minor surgical care': 'Tooth-Specific Minor Surgical Care',
  'teeth whitening': 'Teeth Whitening',
  'dental implants': 'Dental Implants',
  'laser gum treatments': 'Laser Gum Treatments'
};
```

**Important**: Update these values to match your TeleCRM workspace dropdown values exactly. Case-sensitive and must match exactly.

## How It Works

### Data Flow

1. **Appointment Created** → `appointmentController.js`
2. **Appointment Saved** → MongoDB
3. **Emails Sent** → Patient & Admin (existing)
4. **TeleCRM Lead Created** → `telecrmService.createLead()`

### TeleCRM Payload Structure

```javascript
{
  fields: {
    name: "Patient Full Name",
    phone: "+919154129964",  // Formatted automatically
    email: "patient@example.com",
    appointment_date_and_time: "25/12/2024 14:30:00",  // Formatted automatically
    client_concerns: "Dental Implants",  // Mapped from service
    note: "Patient message if provided",
    lead_source: "sashasmiles.com"
  }
}
```

## Testing

### 1. Test Appointment Creation

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9154129964",
    "preferredDate": "2024-12-25",
    "preferredTime": "14:30",
    "service": "Dental Implants",
    "message": "Need consultation for dental implants"
  }'
```

### 2. Check Logs

Look for these log messages:

- ✅ `🔵 TeleCRM createLead called for appointment: John Doe`
- ✅ `✅ TeleCRM lead created successfully for: John Doe`

Or errors:

- ❌ `❌ TELECRM_API_TOKEN is not set or is empty!`
- ❌ `❌ Failed to send lead to TeleCRM: [error message]`

### 3. Verify in TeleCRM Dashboard

1. Log into your TeleCRM dashboard
2. Check for new leads
3. Verify all fields are populated correctly

## Troubleshooting

### Leads Not Appearing in TeleCRM

1. **Check API Token**
   - Verify `TELECRM_API_TOKEN` is set in `.env`
   - Ensure token is valid and not expired

2. **Check Enterprise ID**
   - Verify `TELECRM_ENTERPRISE_ID` is correct
   - Check TeleCRM dashboard settings

3. **Check Logs**
   - Look for error messages in server console
   - Check for network errors or API response issues

4. **Verify Field Names**
   - Field names must match TeleCRM workspace exactly
   - Common fields: `name`, `phone`, `email`, `appointment_date_and_time`, `client_concerns`, `note`, `lead_source`

### "N/A" in CLIENT CONCERNS

- Update service mappings in `mapServiceToClientConcerns()` method
- Ensure service names match TeleCRM dropdown values exactly
- Check case sensitivity

### Phone Format Errors

- Phone numbers are automatically formatted to Indian format (+91XXXXXXXXXX)
- If issues persist, check `formatPhoneNumber()` method
- Ensure phone numbers are provided in the appointment

### Field Name Mismatches

- Verify field names in your TeleCRM workspace
- Update field names in `telecrmService.js` if needed
- Common TeleCRM fields:
  - `name` → Lead name
  - `phone` → Phone number
  - `email` → Email address
  - `appointment_date_and_time` → Appointment date/time
  - `client_concerns` → Service/concern type
  - `note` → Additional message
  - `lead_source` → Source identifier

## Important Notes

- ✅ **Fire-and-Forget**: TeleCRM failures don't affect appointment creation
- ✅ **Email Still Works**: Existing email functionality is preserved
- ✅ **Automatic Formatting**: Phone numbers and dates are formatted automatically
- ✅ **Error Logging**: All errors are logged but don't break the flow
- ⚠️ **Service Mappings**: Must match TeleCRM dropdown values exactly
- ⚠️ **Field Names**: Must match TeleCRM workspace field names exactly

## Environment Variables Summary

Add these to your `.env` file:

```env
# TeleCRM Configuration
TELECRM_API_URL=https://next-api.telecrm.in
TELECRM_ENTERPRISE_ID=your_enterprise_id
TELECRM_API_TOKEN=your_api_token
TELECRM_LEAD_SOURCE=sashasmiles.com
```

## Files Modified

1. ✅ `src/services/telecrmService.js` - New TeleCRM service
2. ✅ `src/controllers/appointmentController.js` - Integrated TeleCRM call
3. ✅ `TELECRM_INTEGRATION.md` - This documentation

## Next Steps

1. ✅ Add TeleCRM credentials to `.env`
2. ✅ Update service mappings to match your TeleCRM dropdown values
3. ✅ Test appointment creation
4. ✅ Verify leads appear in TeleCRM dashboard
5. ✅ Monitor logs for any issues

## Support

If you encounter issues:

1. Check server logs for error messages
2. Verify all environment variables are set
3. Test TeleCRM API token independently
4. Verify field names match your TeleCRM workspace
5. Update service mappings if needed

---

**Integration Complete!** 🎉

Your appointment system now automatically creates leads in TeleCRM while maintaining all existing email functionality.


