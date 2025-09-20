# kubkars

An app for recording results of races when running Kub Kars or Scout Trucks events.

NOTE: This app is NOT endorsed by Scouts Canada or anyone else; it is my own work.

This app came about because of a need for Scouters to be able to easily record the results of races when they are hosting races.

The app is intended to be hosted as an offline server, using a local wifi setup, with NO INTERNET. It is NOT intended to be online, open to the web; hence things like HTTP is probably OK.

The app requires a local Microsoft SQL Server be installed. Scripts are provided to create empty databases.

Data entry, setting up the tracks, entering the names of the racers, etc, is not covered here. That is handled by a separate app.


## Quick Start

To run this app, clone the repository and install dependencies:

```bash
$ git clone https://github.com/JamesProfitt/kubkars.git
$ cd kubkars
$ npm install
```

Then start the server.

```bash
$ npm start
```

Navigate to [`http://localhost`](http://localhost).

