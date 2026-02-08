# WA Boost - WhatsApp Broadcast Manager

Professional broadcast messaging system for WhatsApp Web with analytics and automation.

## Features

- Broadcast personalized messages to multiple contacts
- CSV/Excel contact import with validation
- Template editor with variable substitution ({{firstName}}, {{lastName}}, etc.)
- Real-time campaign progress tracking
- Rate limiting to avoid WhatsApp bans
- Fully local processing (no external servers)
- Pause/resume campaigns
- Scalable architecture (1000+ contacts)

## Tech Stack

- **TypeScript** - Type safety
- **React 18** - UI framework
- **Dexie.js** - IndexedDB wrapper for data persistence
- **TailwindCSS** - Styling
- **Webpack 5** - Bundler
- **Manifest V3** - Chrome extension standard

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wa-boost.git
   cd wa-boost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development build:
   ```bash
   npm run dev
   ```

4. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## Usage

### 1. Create a Campaign

1. Click the WA Boost extension icon in your Chrome toolbar
2. Click "New Campaign"
3. Enter a campaign name
4. Write your message template using variables:
   - `{{firstName}}` - Contact's first name
   - `{{lastName}}` - Contact's last name
   - `{{phone}}` - Contact's phone number
   - Custom variables from your CSV

### 2. Import Contacts

1. Prepare a CSV file with columns: `phone`, `firstName`, `lastName`
2. Phone numbers must be in international format (e.g., +1234567890)
3. Click "Import Contacts" and upload your CSV
4. Review and confirm the imported contacts

### 3. Start Campaign

1. Click "Start Campaign"
2. Open WhatsApp Web in a Chrome tab
3. Messages will be sent automatically with rate limiting
4. Monitor progress in the extension popup

### 4. Pause/Resume

- Click "Pause" to stop sending messages
- Click "Resume" to continue from where you left off

## Rate Limiting

To avoid WhatsApp bans, WA Boost enforces strict rate limits:

- **Delay between messages**: 2-3 seconds (randomized)
- **Messages per hour**: 60
- **Messages per day**: 1000

These limits are designed to mimic human behavior and protect your WhatsApp account.

## Project Structure

```
wa-boost/
├── src/
│   ├── background/          # Service worker (background logic)
│   ├── content/             # Content script (WhatsApp Web integration)
│   ├── core/
│   │   ├── database/        # IndexedDB schema and repositories
│   │   ├── services/        # Business logic services
│   │   ├── queue/           # Message queue and processing
│   │   └── utils/           # Utility functions
│   ├── ui/                  # React components
│   ├── types/               # TypeScript type definitions
│   └── shared/              # Shared constants and protocols
├── public/                  # Static assets
└── tests/                   # Unit and integration tests
```

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Security & Privacy

WA Boost is designed with privacy in mind:

- **Fully local**: All data is processed locally in your browser
- **No external servers**: No data is sent to any external server
- **No telemetry**: No usage tracking or analytics
- **Minimal permissions**: Only requests permissions necessary for WhatsApp Web

## Disclaimer

**IMPORTANT**: This extension automates WhatsApp Web interactions. Use responsibly and in compliance with WhatsApp's Terms of Service.

- Do not use for spamming or unsolicited messages
- Respect rate limits to avoid account bans
- Only message contacts who have opted in
- The authors are not responsible for account bans resulting from misuse

WhatsApp may ban accounts that use automation tools. Use at your own risk.

## Troubleshooting

### Extension doesn't load

- Make sure you're loading the `dist/` folder, not the root folder
- Run `npm run build` to generate the dist folder
- Check Chrome DevTools console for errors

### Messages not sending

- Make sure WhatsApp Web is open in a Chrome tab
- Verify you're logged into WhatsApp Web
- Check that phone numbers are in E.164 format (+1234567890)
- WhatsApp Web may have updated its DOM - check for selector errors in console

### Rate limit errors

- This is normal - the extension enforces rate limits to protect your account
- Wait for the next time slot or reduce your sending rate
- Check daily/hourly limits in settings

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm run lint` and `npm test`
6. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE)

## Roadmap

- [x] Phase 1: Broadcast messaging with CSV import
- [ ] Phase 2: Analytics dashboard
- [ ] Phase 3: Scheduled messaging
- [ ] Phase 4: CRM integrations (HubSpot, Salesforce)
- [ ] Phase 5: Webhook support
- [ ] Phase 6: Smart replies automation

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with by Mohammed
