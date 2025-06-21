# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HubSpot UI Extensions project for property management (物件管理システム). Adds a CRM card to Deal records that opens an iframe modal displaying a Vercel-hosted property management interface with JWT authentication.

## Project Structure

```
PropertyManagement-UIExtensions/
├── hsproject.json              # HubSpot project configuration (v2023.2)
├── hubspot.config.yml          # Portal authentication configuration
├── src/app/
│   ├── app.json               # Application manifest with scopes & extensions
│   ├── extensions/            # UI Extensions (React components)
│   │   ├── property-management-card.json    # CRM card configuration
│   │   ├── property-management.jsx          # React component
│   │   └── package.json                     # React 18 & HubSpot UI SDK
│   └── app.functions/         # Serverless functions
│       ├── generate-token.js  # JWT token generator
│       ├── serverless.json    # Function configuration
│       └── package.json       # axios, jsonwebtoken dependencies
```

## Development Commands

### Essential Commands
```bash
# Local development with hot reload
hs project dev

# Upload changes to HubSpot (creates new build)
hs project upload

# Deploy latest build to production
hs project deploy

# Watch mode for auto-upload on changes
hs project watch
```

### Environment Management
```bash
# Switch between accounts (if multiple configured)
hs project dev --account kw-property-mgmt-sandbox
hs accounts list
hs accounts use kw-property-mgmt-sandbox
```

### Secrets & Configuration
```bash
# Manage JWT_SECRET environment variable
hs secrets list
hs secrets add JWT_SECRET
hs secrets update JWT_SECRET
```

### Debugging
```bash
# View serverless function logs
hs project logs --function generate-token
hs project logs --endpoint /execute/generate-token
```

## Architecture & Key Components

### 1. **CRM Card UI Extension**
- **Location**: Deal record sidebar tab
- **Component**: `property-management.jsx` - React component using HubSpot UI Extensions SDK
- **Function**: Opens iframe modal with JWT-authenticated property management system
- **Configuration**: `property-management-card.json` defines CRM card placement

### 2. **JWT Authentication Flow**
- **Function**: `generate-token.js` generates JWT tokens
- **Secret**: Requires `JWT_SECRET` environment variable in HubSpot
- **Token Spec**: 
  - Expiration: 1 hour
  - Payload: `{ dealId, iat, exp }`
  - URL params: `?deal={dealId}&token={jwt_token}`

### 3. **Environment Detection**
- **Sandbox**: Portal ID = 45016714 → Uses Vercel preview URLs
- **Production**: Other Portal IDs → Uses `property-mgmt-xi.vercel.app`

### 4. **HubSpot Configuration**
- **Scopes**: `crm.objects.deals.read`, `crm.objects.deals.write`
- **Extension Type**: CRM card (not full-page app)
- **Private App**: Not publicly listed

## Important Implementation Details

### Modal Window Handling
The React component uses HubSpot's `actions.openIframeModal()` to display the property management interface:
- Modal dimensions: 1200x800px
- Automatically includes JWT token and deal ID in URL
- Handles environment-specific URLs

### Error Handling Pattern
Both the React component and serverless function implement try-catch with console logging:
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error description:', error);
  // Return appropriate error response
}
```

### Security Considerations
- JWT tokens are generated server-side only
- Tokens expire after 1 hour
- Both HubSpot and Vercel must share the same JWT_SECRET
- HTTPS required in production

## Development Workflow

1. **Initial Setup**
   ```bash
   # Install dependencies
   cd src/app/extensions && npm install
   cd ../app.functions && npm install
   ```

2. **Development**
   ```bash
   # Start development server
   hs project dev
   
   # Make changes to:
   # - property-management.jsx for UI changes
   # - generate-token.js for authentication changes
   # Changes auto-reload in browser
   ```

3. **Testing**
   - Navigate to any Deal record in HubSpot
   - Look for "物件管理システム" card in sidebar
   - Click "物件管理画面を開く" button to test iframe modal

4. **Deployment**
   ```bash
   hs project upload --message "Description of changes"
   hs project deploy
   ```

## Common Tasks

### Updating the Vercel URL
Edit `property-management.jsx`:
- Sandbox URL: Update `sandboxUrl` variable
- Production URL: Update condition in `getPropertyManagementUrl()`

### Modifying JWT Token Payload
Edit `generate-token.js`:
- Add fields to the payload object in `jwt.sign()`
- Remember to update Vercel app to handle new fields

### Changing Modal Size
Edit `property-management.jsx`:
- Modify `width` and `height` in `openIframeModal()` call

## Notes
- No test framework configured
- No linting/formatting tools configured
- Uses JavaScript (not TypeScript)
- No CI/CD pipelines configured