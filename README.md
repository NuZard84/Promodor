# Promodor - Pomodoro Timer Desktop App

A simple Pomodoro timer desktop application built with Electron and React.

## Features

- 25-minute work timer
- 5-minute break timer
- Pause, resume, and reset functionality
- Switch between work and break modes

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Install client dependencies:

```bash
cd client
npm install
cd ..
```

## Development

To run the app in development mode:

```bash
npm run dev
```

This will start both the React development server and the Electron app.

## Building the App

To build the application for production:

```bash
npm run build
```

The built application will be in the `dist` folder.

## Usage

1. Click "Start" to begin the timer
2. Click "Pause" to pause the timer
3. Click "Reset" to reset the timer to its initial state
4. Click "Switch to Break/Work" to manually switch between work and break modes

The timer will automatically switch between work (25 minutes) and break (5 minutes) modes when the countdown reaches zero.

## License

ISC 