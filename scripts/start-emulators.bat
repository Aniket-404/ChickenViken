@echo off
echo Starting Firebase emulators with test data...

echo Initializing test data...
cd ../

rem Create a directory for emulator data if it doesn't exist
if not exist ".emulator-data" mkdir ".emulator-data"

rem Run Firebase emulators with data persistence
firebase emulators:start --import=.emulator-data --export-on-exit=.emulator-data

echo Firebase emulators stopped.
