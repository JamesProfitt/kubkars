const express = require('express');
var router = express.Router();
var dbop = require('@db/db_operations');

////////////////////////////////////////////////////////////
//// 
//// DATA SOURCE SELECTION (dbID)
//// 
//// 1 = Cubs
//// 2 = Scouts
//// 
//// Selection stored as a cookie on the users' device
//// Can be updated if they choose to switch
//// 
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
// VehiclesPerHeat
////////////////////////////////////////////////////////////

router.route('/cubs/vehicles_per_heat').get((request, response) => {

    dbop.getVehiclesPerHeat(1)
      .then((data) => {response.json(data[0]);})
      .catch(err => response.status(500).send(err));
  
})

router.route('/scouts/vehicles_per_heat').get((request, response) => {

    dbop.getVehiclesPerHeat(2)
      .then((data) => {response.json(data[0]);})
      .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Routes for Tracks
// This route used in "setting_up" and "recording"
// 
// Shows available tracks. Folks will need to choose
// the one they are using
////////////////////////////////////////////////////////////

router.route('/cubs/tracks').get((request, response) => {

    dbop.getTracks(1)
      .then((data) => {response.json(data[0]);})
      .catch(err => response.status(500).send(err));

})

router.route('/scouts/tracks').get((request, response) => {

    dbop.getTracks(2)
      .then((data) => {response.json(data[0]);})
      .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Routes for Races
// This route used in "setting_up" and "recording"
// 
// Shows Lane and Car assignments for a particular 
// heat & track
////////////////////////////////////////////////////////////

router.route('/cubs/race/:Trackid/:HeatID/:RunType').get((request, response) => {

    dbop.GetRace(1,request.params.Trackid,request.params.HeatID,request.params.RunType)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/race/:Trackid/:HeatID/:RunType').get((request, response) => {
  
    dbop.GetRace(2,request.params.Trackid,request.params.HeatID,request.params.RunType)
      .then((data) => {response.json(data[0]);})
  	  .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Route for All Races for a Track
// Not currently used.
////////////////////////////////////////////////////////////

router.route('/cubs/races/:Trackid').get((request, response) => {
  
    dbop.GetAllRaces(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));
    
})

router.route('/scouts/races/:Trackid').get((request, response) => {
  
    dbop.GetAllRaces(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));
    
})

////////////////////////////////////////////////////////////
// Routes for Unfinished Heats
// This route used in "setting_up" and "recording"
// 
// Shows Lane and Car assignments for a particular 
// heat & track
////////////////////////////////////////////////////////////

router.route('/cubs/unfinished_heats/:Trackid').get((request, response) => {

    dbop.GetUnfinishedHeats(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/unfinished_heats/:Trackid').get((request, response) => {

    dbop.GetUnfinishedHeats(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Routes for Unfinished RunOffs
// This route used in "setting_up" and "recording"
// 
// Shows Lane and Car assignments for a particular 
// heat & track
////////////////////////////////////////////////////////////

router.route('/cubs/unfinished_runoffs/:Trackid').get((request, response) => {

    dbop.GetUnfinishedRunOffs(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/unfinished_runoffs/:Trackid').get((request, response) => {

    dbop.GetUnfinishedRunOffs(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Count Unfinished Heats
// This route used in "setting_up" and "recording"
// 
// Shows Lane and Car assignments for a particular 
// heat & track
////////////////////////////////////////////////////////////

router.route('/cubs/count_unfinished_heats/:Trackid').get((request, response) => {

    dbop.CountUnfinishedHeats(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/count_unfinished_heats/:Trackid').get((request, response) => {

    dbop.CountUnfinishedHeats(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Count Unfinished RunOffs
// This route used in "setting_up" and "recording"
// 
// Shows Lane and Car assignments for a particular 
// heat & track
////////////////////////////////////////////////////////////

router.route('/cubs/count_unfinished_runoffs/:Trackid').get((request, response) => {

    dbop.CountUnfinishedRunOffs(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/count_unfinished_runoffs/:Trackid').get((request, response) => {

    dbop.CountUnfinishedRunOffs(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// GetLatestFinishedHeats
// This route used in "recording"
// 
// Gets the most recent 5 RunOffs to be unlocked
////////////////////////////////////////////////////////////

router.route('/cubs/latest_finished_heats/:Trackid').get((request, response) => {

    dbop.GetLatestFinishedHeats(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/latest_finished_heats/:Trackid').get((request, response) => {

    dbop.GetLatestFinishedHeats(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// GetLatestFinishedRunOffs
// This route used in "recording"
// 
// Gets the most recent 5 RunOffs to be unlocked
////////////////////////////////////////////////////////////

router.route('/cubs/latest_finished_runoffs/:Trackid').get((request, response) => {

    dbop.GetLatestFinishedRunOffs(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/latest_finished_runoffs/:Trackid').get((request, response) => {

    dbop.GetLatestFinishedRunOffs(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Track Summary Stats
////////////////////////////////////////////////////////////

router.route('/cubs/tracksummary/:Trackid').get((request, response) => {

    dbop.GetTrackSummaryStats(1,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/tracksummary/:Trackid').get((request, response) => {

    dbop.GetTrackSummaryStats(2,request.params.Trackid)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// Summary Stats
////////////////////////////////////////////////////////////

router.route('/cubs/summary').get((request, response) => {

    dbop.GetSummaryStats(1)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/summary').get((request, response) => {

    dbop.GetSummaryStats(2)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// GetHeatStatsByTrack
////////////////////////////////////////////////////////////

router.route('/cubs/heatstats').get((request, response) => {

    dbop.GetHeatStatsByTrack(1)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/heatstats').get((request, response) => {

    dbop.GetHeatStatsByTrack(2)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// GetRunOffStatsByTrack
////////////////////////////////////////////////////////////

router.route('/cubs/runoffstats').get((request, response) => {

    dbop.GetRunOffStatsByTrack(1)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/runoffstats').get((request, response) => {

    dbop.GetRunOffStatsByTrack(2)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// UnlockRace
////////////////////////////////////////////////////////////

router.route('/cubs/unlockrace/:RaceType/:TrackID/:HeatID/:Signature').get((request, response) => {

    dbop.UnlockRace(1,request.params.RaceType, request.params.TrackID, request.params.HeatID, request.params.Signature)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/unlockrace/:RaceType/:TrackID/:HeatID/:Signature').get((request, response) => {

    dbop.UnlockRace(2,request.params.RaceType, request.params.TrackID, request.params.HeatID, request.params.Signature)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

////////////////////////////////////////////////////////////
// SaveResults
////////////////////////////////////////////////////////////

router.route('/cubs/saveresults/:RaceType/:TrackID/:HeatID/:Result1/:Result2/:Result3/:Result4/:Result5/:Result6/:Signature').get((request, response) => {

    dbop.SaveResults(1,request.params.RaceType, request.params.TrackID, request.params.HeatID, request.params.Result1, request.params.Result2, request.params.Result3, request.params.Result4, request.params.Result5, request.params.Result6, request.params.Signature)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

router.route('/scouts/saveresults/:RaceType/:TrackID/:HeatID/:Result1/:Result2/:Result3/:Result4/:Result5/:Result6/:Signature').get((request, response) => {

    dbop.SaveResults(2,request.params.RaceType, request.params.TrackID, request.params.HeatID, request.params.Result1, request.params.Result2, request.params.Result3, request.params.Result4, request.params.Result5, request.params.Result6, request.params.Signature)
      .then((data) => {response.json(data[0]);})
	    .catch(err => response.status(500).send(err));

})

module.exports = router;