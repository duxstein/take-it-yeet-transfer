
export const statusMessages = [
  "Transferring... or are we?",
  "Files in transit (probably)",
  "Yeeting data across the internet",
  "Doing computer stuff right now",
  "Transferring at ludicrous speed!",
  "Moving 1's and 0's around (mostly 0's)",
  "Breaking physics to transfer your file",
  "Packets are doing their best",
  "Your file is somewhere in the cloud now",
  "Data going brrrrrrrr",
  "Electrons are working overtime",
  "File transfer status: ¯\\_(ツ)_/¯",
  "Moving bits and bytes and stuff",
  "Loading bar would go here if we cared",
  "Progress: maybe halfway? who knows",
  "Calculating time remaining... like, forever?",
  "Transfer speed: yes",
  "Internet doing internet things with your file"
];

export const errorMessages = [
  "Oops. Your files yeeted into the void.",
  "Task failed successfully!",
  "Error 404: Success not found",
  "Computer says noooope",
  "Have you tried turning it off and... just off?",
  "File transfer.exe has stopped working",
  "Something broke, but we won't tell you what",
  "Your file took a wrong turn at Albuquerque",
  "The internet tubes are clogged",
  "Error: Too much success, system confused",
  "Connection failed: The internet is being shy today",
  "File transfer failed: Mercury is in retrograde",
  "Looks like your data got lost in the sauce",
  "Server response: 'I don't feel like it'",
  "Your file was eaten by digital gremlins"
];

export const getRandomMessage = (array: string[]): string => {
  return array[Math.floor(Math.random() * array.length)];
};
