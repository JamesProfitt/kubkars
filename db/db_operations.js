require('module-alias/register');

const sql = require('mssql/msnodesqlv8');
var dbconfig_cubs = require('@config/dbconfig_cubs');
var dbconfig_scouts = require('@config/dbconfig_scouts');

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
//// The RACE queries require all Lane1-Lane6 fields are
//// present in the database. However, the pages check
//// the value in VehiclesPerHeat in dbo.settings
//// to see if the extra columns need to be shown or not.
////
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
// getVehiclesPerHeat
// Used in setting_up, recording and monitoring to determine
// how many lanes to show in the current/next race tables.
////////////////////////////////////////////////////////////

async function getVehiclesPerHeat(dbID)
{
    try 
    {
       if (dbID == 1) 
       {
           var pool = await sql.connect(dbconfig_cubs);
       }
       else if (dbID == 2) 
       {
           var pool = await sql.connect(dbconfig_scouts);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       var products = await pool.request().query("select VehiclesPerHeat " + 
                                                 "  from settings ");
       return products.recordsets;
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// getTracks
// Used in setting_up.html to populate the dropdown for track selection
////////////////////////////////////////////////////////////

async function getTracks(dbID)
{
    try 
    {
       if (dbID == 1) 
       {
           var pool = await sql.connect(dbconfig_cubs);
       }
       else if (dbID == 2) 
       {
           var pool = await sql.connect(dbconfig_scouts);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       var products = await pool.request().query("select track " + 
                                                 "  from tracks " +
                                                 " union " +
                                                 "select track " + 
                                                 "  from runofftracks "
                                                 );
       return products.recordsets;
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetRace
// Returns a specific Heat / RunOff
// Used when populating the current and next tables
// for either a regular heat, or a runoff
// Functions consuming the data should check run_type
// TODO: "group" info isn't used right now - remove?
//       might be too long for a mobile screen
////////////////////////////////////////////////////////////

async function GetRace(dbID, TrackID, HeatID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       num_HeatID = parseInt(HeatID)
       if (Number.isInteger(num_trackID) & Number.isInteger(num_HeatID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .input('HeatID', sql.Int, num_HeatID)
             .query("select 1 as run_type" + 
                    "      ,h.track" + 
                    "      ,h.heat" + 
                    "      ,h.lane1 as lane1_carNumber" + 
                    "      ,h.lane2 as lane2_carNumber" + 
                    "      ,h.lane3 as lane3_carNumber" + 
                    "      ,h.lane4 as lane4_carNumber" + 
                    "      ,h.lane5 as lane5_carNumber" + 
                    "      ,h.lane6 as lane6_carNumber" + 
                    "      ,c1.Name as lane1_driver" + 
                    "      ,c2.Name as lane2_driver" + 
                    "      ,c3.Name as lane3_driver" + 
                    "      ,c4.Name as lane4_driver" + 
                    "      ,c5.Name as lane5_driver" + 
                    "      ,c6.Name as lane6_driver" + 
                    "      ,c1.[Group] as lane1_group" + 
                    "      ,c2.[Group] as lane2_group" + 
                    "      ,c3.[Group] as lane3_group" + 
                    "      ,c4.[Group] as lane4_group" + 
                    "      ,c5.[Group] as lane5_group" + 
                    "      ,c6.[Group] as lane6_group" + 
                    "  from Heats h " + 
                    "  left join Cars c1 " + 
                    "    on h.lane1 = c1.CarNumber " + 
                    "  left join Cars c2 " + 
                    "    on h.lane2 = c2.CarNumber " + 
                    "  left join Cars c3 " + 
                    "    on h.lane3 = c3.CarNumber " + 
                    "  left join Cars c4 " + 
                    "    on h.lane4 = c4.CarNumber " + 
                    "  left join Cars c5 " + 
                    "    on h.lane5 = c5.CarNumber " + 
                    "  left join Cars c6 " + 
                    "    on h.lane6 = c6.CarNumber " + 
                    " where h.Track = @TrackID " + 
                    "   and h.heat = @HeatID " +
                    "   and h.run is null " +
                    " union " +
                    "select 2 as run_type" + 
                    "      ,r.track" + 
                    "      ,r.heat" + 
                    "      ,r.lane1 as lane1_carNumber" + 
                    "      ,r.lane2 as lane2_carNumber" + 
                    "      ,r.lane3 as lane3_carNumber" + 
                    "      ,r.lane4 as lane4_carNumber" + 
                    "      ,r.lane5 as lane5_carNumber" + 
                    "      ,r.lane6 as lane6_carNumber" + 
                    "      ,rc1.Name as lane1_driver" + 
                    "      ,rc2.Name as lane2_driver" + 
                    "      ,rc3.Name as lane3_driver" + 
                    "      ,rc4.Name as lane4_driver" + 
                    "      ,rc5.Name as lane5_driver" + 
                    "      ,rc6.Name as lane6_driver" + 
                    "      ,rc1.[Group] as lane1_group" + 
                    "      ,rc2.[Group] as lane2_group" + 
                    "      ,rc3.[Group] as lane3_group" + 
                    "      ,rc4.[Group] as lane4_group" + 
                    "      ,rc5.[Group] as lane5_group" + 
                    "      ,rc6.[Group] as lane6_group" + 
                    "  from runoffs r " + 
                    "  left join Cars rc1 " + 
                    "    on r.lane1 = rc1.CarNumber " + 
                    "  left join Cars rc2 " + 
                    "    on r.lane2 = rc2.CarNumber " + 
                    "  left join Cars rc3 " + 
                    "    on r.lane3 = rc3.CarNumber " + 
                    "  left join Cars rc4 " + 
                    "    on r.lane4 = rc4.CarNumber " + 
                    "  left join Cars rc5 " + 
                    "    on r.lane5 = rc5.CarNumber " + 
                    "  left join Cars rc6 " + 
                    "    on r.lane6 = rc6.CarNumber " + 
                    " where r.Track = @TrackID " + 
                    "   and r.heat = @HeatID " +
                    "   and r.run is null"
                    );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetAllRaces
// TODO: "group" info isn't used right now - remove?
//       might be too long for a mobile screen
////////////////////////////////////////////////////////////

async function GetAllRaces(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select 1 as run_type" + 
                    "      ,h.track" + 
                    "      ,h.heat" + 
                    "      ,h.lane1 as lane1_carNumber" + 
                    "      ,h.lane2 as lane2_carNumber" + 
                    "      ,h.lane3 as lane3_carNumber" + 
                    "      ,h.lane4 as lane4_carNumber" + 
                    "      ,h.lane5 as lane5_carNumber" + 
                    "      ,h.lane6 as lane6_carNumber" + 
                    "      ,c1.Name as lane1_driver" + 
                    "      ,c2.Name as lane2_driver" + 
                    "      ,c3.Name as lane3_driver" + 
                    "      ,c4.Name as lane4_driver" + 
                    "      ,c5.Name as lane5_driver" + 
                    "      ,c6.Name as lane6_driver" + 
                    "      ,c1.[Group] as lane1_group" + 
                    "      ,c2.[Group] as lane2_group" + 
                    "      ,c3.[Group] as lane3_group" + 
                    "      ,c4.[Group] as lane4_group" + 
                    "      ,c5.[Group] as lane5_group" + 
                    "      ,c6.[Group] as lane6_group" + 
                    "  from Heats h " + 
                    "  left join Cars c1 " + 
                    "    on h.lane1 = c1.CarNumber " + 
                    "  left join Cars c2 " + 
                    "    on h.lane2 = c2.CarNumber " + 
                    "  left join Cars c3 " + 
                    "    on h.lane3 = c3.CarNumber " + 
                    "  left join Cars c4 " + 
                    "    on h.lane4 = c4.CarNumber " + 
                    "  left join Cars c5 " + 
                    "    on h.lane5 = c5.CarNumber " + 
                    "  left join Cars c6 " + 
                    "    on h.lane6 = c6.CarNumber " + 
                    " where h.Track = @TrackID " + 
                    " union " +
                    "select 2 as run_type" + 
                    "      ,r.track" + 
                    "      ,r.heat" + 
                    "      ,r.lane1 as lane1_carNumber" + 
                    "      ,r.lane2 as lane2_carNumber" + 
                    "      ,r.lane3 as lane3_carNumber" + 
                    "      ,r.lane4 as lane4_carNumber" + 
                    "      ,r.lane5 as lane5_carNumber" + 
                    "      ,r.lane6 as lane6_carNumber" + 
                    "      ,rc1.Name as lane1_driver" + 
                    "      ,rc2.Name as lane2_driver" + 
                    "      ,rc3.Name as lane3_driver" + 
                    "      ,rc3.Name as lane4_driver" + 
                    "      ,rc3.Name as lane5_driver" + 
                    "      ,rc3.Name as lane6_driver" + 
                    "      ,rc1.[Group] as lane1_group" + 
                    "      ,rc2.[Group] as lane2_group" + 
                    "      ,rc3.[Group] as lane3_group" + 
                    "      ,rc4.[Group] as lane4_group" + 
                    "      ,rc5.[Group] as lane5_group" + 
                    "      ,rc6.[Group] as lane6_group" + 
                    "  from runoffs r " + 
                    "  left join Cars rc1 " + 
                    "    on r.lane1 = rc1.CarNumber " + 
                    "  left join Cars rc2 " + 
                    "    on r.lane2 = rc2.CarNumber " + 
                    "  left join Cars rc3 " + 
                    "    on r.lane3 = rc3.CarNumber " + 
                    "  left join Cars rc4 " + 
                    "    on r.lane4 = rc4.CarNumber " + 
                    "  left join Cars rc5 " + 
                    "    on r.lane5 = rc5.CarNumber " + 
                    "  left join Cars rc6 " + 
                    "    on r.lane6 = rc6.CarNumber " + 
                    " where r.Track = @TrackID " +
                    " order by run_type, track, heat "
                    );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetUnfinishedHeats
// Used to populate the current and next heat tables
// TODO: "group" info isn't used right now - remove?
//       might be too long for a mobile screen
////////////////////////////////////////////////////////////

async function GetUnfinishedHeats(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select h.track" + 
                    "      ,h.heat" + 
                    "      ,h.lane1 as lane1_carNumber" + 
                    "      ,h.lane2 as lane2_carNumber" + 
                    "      ,h.lane3 as lane3_carNumber" + 
                    "      ,h.lane4 as lane4_carNumber" + 
                    "      ,h.lane5 as lane5_carNumber" + 
                    "      ,h.lane6 as lane6_carNumber" + 
                    "      ,c1.Name as lane1_driver" + 
                    "      ,c2.Name as lane2_driver" + 
                    "      ,c3.Name as lane3_driver " + 
                    "      ,c4.Name as lane4_driver " + 
                    "      ,c5.Name as lane5_driver " + 
                    "      ,c6.Name as lane6_driver " + 
                    "      ,c1.[Group] as lane1_group" + 
                    "      ,c2.[Group] as lane2_group" + 
                    "      ,c3.[Group] as lane3_group" + 
                    "      ,c4.[Group] as lane4_group" + 
                    "      ,c5.[Group] as lane5_group" + 
                    "      ,c6.[Group] as lane6_group" + 
                    "  from Heats h " + 
                    "  left join Cars c1 " + 
                    "    on h.lane1 = c1.CarNumber " + 
                    "  left join Cars c2 " + 
                    "    on h.lane2 = c2.CarNumber " + 
                    "  left join Cars c3 " + 
                    "    on h.lane3 = c3.CarNumber " + 
                    "  left join Cars c4 " + 
                    "    on h.lane4 = c4.CarNumber " + 
                    "  left join Cars c5 " + 
                    "    on h.lane5 = c5.CarNumber " + 
                    "  left join Cars c6 " + 
                    "    on h.lane6 = c6.CarNumber " + 
                    " where h.Track = @TrackID " + 
                    "   and h.Run is null " + 
                    " order by h.heat");
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetUnfinishedRunOffs
// Used to populate the current and next RunOff tables
// TODO: "group" info isn't used right now - remove?
//       might be too long for a mobile screen
////////////////////////////////////////////////////////////

async function GetUnfinishedRunOffs(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select r.track" + 
                    "      ,r.heat" + 
                    "      ,r.lane1 as lane1_carNumber" + 
                    "      ,r.lane2 as lane2_carNumber" + 
                    "      ,r.lane3 as lane3_carNumber" + 
                    "      ,r.lane4 as lane4_carNumber" + 
                    "      ,r.lane5 as lane5_carNumber" + 
                    "      ,r.lane6 as lane6_carNumber" + 
                    "      ,rc1.Name as lane1_driver" + 
                    "      ,rc2.Name as lane2_driver" + 
                    "      ,rc3.Name as lane3_driver " + 
                    "      ,rc4.Name as lane4_driver " + 
                    "      ,rc5.Name as lane5_driver " + 
                    "      ,rc6.Name as lane6_driver " + 
                    "      ,rc1.[Group] as lane1_group" + 
                    "      ,rc2.[Group] as lane2_group" + 
                    "      ,rc3.[Group] as lane3_group" + 
                    "      ,rc4.[Group] as lane4_group" + 
                    "      ,rc5.[Group] as lane5_group" + 
                    "      ,rc6.[Group] as lane6_group" + 
                    "  from RunOffs r " + 
                    "  left join Cars rc1 " + 
                    "    on r.lane1 = rc1.CarNumber " + 
                    "  left join Cars rc2 " + 
                    "    on r.lane2 = rc2.CarNumber " + 
                    "  left join Cars rc3 " + 
                    "    on r.lane3 = rc3.CarNumber " + 
                    "  left join Cars rc4 " + 
                    "    on r.lane4 = rc4.CarNumber " + 
                    "  left join Cars rc5 " + 
                    "    on r.lane5 = rc5.CarNumber " + 
                    "  left join Cars rc6 " + 
                    "    on r.lane6 = rc6.CarNumber " + 
                    " where r.Track = @TrackID " + 
                    "   and r.Run is null " + 
                    " order by r.heat");
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// CountUnfinishedHeats
// Used to populate the current and next heat tables
// for individual tracks
////////////////////////////////////////////////////////////

async function CountUnfinishedHeats(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select count(*) as total_heat_count" +
                    "      ,sum(case when run is null then 0 else 1 end) as finished_heats" +
                    "      ,sum(case when run is null then 1 else 0 end) as unfinished_heats" +
                    "  from Heats h " + 
                    " where Track = @TrackID " );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// CountUnfinishedRunOffs
// Used to populate the current and next RunOff tables
////////////////////////////////////////////////////////////

async function CountUnfinishedRunOffs(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("  select count(*) as total_runoff_count" +
                    "        ,sum(case when run is null then 0 else 1 end) as finished_runoffs" +
                    "        ,sum(case when run is null then 1 else 0 end) as unfinished_runoffs" +
                    "    from runoffs" +
                    "   where Track = @TrackID " );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetLatestFinishedHeats
// Finds the most recent top 5 finished heats
// This is used to "unlock" a heat for rerunning if the
// result has already been posted
////////////////////////////////////////////////////////////

async function GetLatestFinishedHeats(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select top 5 track, heat" +
                    "  from Heats h " + 
                    " where Track = @TrackID " +
                    "   and run = 1 " +
                    " order by heat desc" );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetLatestFinishedRunOffs
// Finds the most recent top 5 finished heats
// This is used to "unlock" a heat for rerunning if the
// result has already been posted
////////////////////////////////////////////////////////////

async function GetLatestFinishedRunOffs(dbID, TrackID)
{
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("select top 5 track, heat" +
                    "  from runoffs h " + 
                    " where Track = @TrackID " +
                    "   and run = 1 " +
                    " order by heat desc" );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetHeatStatsByTrack
// Used in Monitoring
// Changed to use a shorter version for mobile devices.
////////////////////////////////////////////////////////////

//                "      ,a.total_heat_count" +
//                "      ,a.finished_heats" +
//                "      ,a.unfinished_heats" +
//                "      ,round(cast((100.0 * a.finished_heats) / a.total_heat_count as decimal(8,2)),2) as heats_pct_complete" +

async function GetHeatStatsByTrack(dbID)
{
    try 
    {
       if (dbID == 1) 
       {
           var pool = await sql.connect(dbconfig_cubs);
       }
       else if (dbID == 2) 
       {
           var pool = await sql.connect(dbconfig_scouts);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       var products = await pool.request()
         .query("with heat_count as " +
                "(" +
                "  select track" +
                "        ,count(*) as total_heat_count" +
                "        ,sum(case when run is null then 0 else 1 end) as finished_heats" +
                "        ,sum(case when run is null then 1 else 0 end) as unfinished_heats" +
                "    from heats" +
                "   group by track" +
                ") " +
                "select a.track " + 
                "      ,cast(a.finished_heats as varchar) + '/' + cast(a.total_heat_count as varchar) + ' (' + cast(round(cast((100.0 * a.finished_heats) / a.total_heat_count as decimal(8,2)),2) as varchar) + '%)' as summary" +
                "  from heat_count a"
                );
       return products.recordsets;
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetRunOffStatsByTrack
// Used in Monitoring
// Changed to use a shorter version for mobile devices.
////////////////////////////////////////////////////////////

//                "      ,a.total_runoff_count" +
//                "      ,a.finished_runoffs" +
//                "      ,a.unfinished_runoffs" +
//                "      ,round(cast((100.0 * a.finished_runoffs) / a.total_runoff_count as decimal(8,2)),2) as runoffs_pct_complete" +

async function GetRunOffStatsByTrack(dbID)
{
    try 
    {
       if (dbID == 1) 
       {
           var pool = await sql.connect(dbconfig_cubs);
       }
       else if (dbID == 2) 
       {
           var pool = await sql.connect(dbconfig_scouts);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       var products = await pool.request()
         .query("with runoff_count as " +
                "( " +
                "  select track" +
                "        ,count(*) as total_runoff_count" +
                "        ,sum(case when run is null then 0 else 1 end) as finished_runoffs" +
                "        ,sum(case when run is null then 1 else 0 end) as unfinished_runoffs" +
                "    from runoffs" +
                "   group by track" +
                ") " +
                "select a.track " + 
                "      ,cast(a.finished_runoffs as varchar) + '/' + cast(a.total_runoff_count as varchar) + ' (' + cast(round(cast((100.0 * a.finished_runoffs) / a.total_runoff_count as decimal(8,2)),2) as varchar) + '%)' as summary" +
                "  from runoff_count a"
                );
       return products.recordsets;
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// GetTrackSummaryStats
// Used in Setting Up
// Each subquery is designed to only return 1 record
// The cartesian join at the end should also just be one record
////////////////////////////////////////////////////////////

async function GetTrackSummaryStats(dbID,TrackID)
{
    try
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var pool = await sql.connect(dbconfig_cubs);
           }
           else if (dbID == 2) 
           {
               var pool = await sql.connect(dbconfig_scouts);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
           var products = await pool.request()
             .input('TrackID', sql.Int, num_trackID)
             .query("with heat_count as " +
                    "( " +
                    "  select count(*) as total_heat_count" +
                    "        ,sum(case when run is null then 0 else 1 end) as finished_heats" +
                    "        ,sum(case when run is null then 1 else 0 end) as unfinished_heats" +
                    "        ,min(case when run is null then heat end) as current_heat" +
                    "    from heats" +
                    "   where Track = @TrackID " +
                    "), " +
                    "next_heat as " +
                    "( " +
                    "  select min(case when run is null then heat end) as next_heat" +
                    "    from heats" +
                    "   where Track = @TrackID " +
                    "     and heat > (select current_heat from heat_count) " +
                    ")," +
                    "runoff_count as " +
                    "( " +
                    "  select count(*) as total_runoff_count" +
                    "        ,sum(case when run is null then 0 else 1 end) as finished_runoffs" +
                    "        ,sum(case when run is null then 1 else 0 end) as unfinished_runoffs" +
                    "        ,min(case when run is null then heat end) as current_runoff" +
                    "    from runoffs" +
                    "   where Track = @TrackID " +
                    "), " +
                    "next_runoff as " +
                    "( " +
                    "  select min(case when run is null then heat end) as next_runoff" +
                    "    from runoffs" +
                    "   where Track = @TrackID " +
                    "     and heat > (select current_runoff from runoff_count) " +
                    ") " +
                    "select a.total_heat_count" +
                    "      ,a.finished_heats" +
                    "      ,a.unfinished_heats" +
                    "      ,coalesce(a.current_heat,0) as current_heat" +
                    "      ,coalesce(c.next_heat,0) as next_heat" +
                    "      ,round(cast((100.0 * a.finished_heats) / a.total_heat_count as decimal(8,2)),2) as heats_pct_complete" +
                    "      ,b.total_runoff_count" +
                    "      ,coalesce(b.finished_runoffs,0) as finished_runoffs" +
                    "      ,coalesce(b.unfinished_runoffs,0) as unfinished_runoffs" +
                    "      ,coalesce(b.current_runoff,0) as current_runoff" +
                    "      ,coalesce(d.next_runoff,0) as next_runoff" +
                    "      ,case when b.total_runoff_count > 0 then round(cast((100.0 * coalesce(b.finished_runoffs,0)) / b.total_runoff_count as decimal(8,2)),2) else 100 end as runoffs_pct_complete" +
                    "  from heat_count a" +
                    "      ,runoff_count b" +
                    "      ,next_heat c" +
                    "      ,next_runoff d" );
           return products.recordsets;
       }
    }
    catch(error)
    {
        console.log(error);
    }
}



////////////////////////////////////////////////////////////
// GetSummaryStats
// Used in Monitoring
// Each subquery is designed to only return 1 record
// The cartesian join at the end should also just be one record
// 
// If multi-level stats are needed, will need to redo the query
////////////////////////////////////////////////////////////

async function GetSummaryStats(dbID)
{
    try 
    {
       if (dbID == 1) 
       {
           var pool = await sql.connect(dbconfig_cubs);
       }
       else if (dbID == 2) 
       {
           var pool = await sql.connect(dbconfig_scouts);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       var products = await pool.request()
         .query("with heat_count as " +
                "(" +
                "  select count(*) as total_heat_count" +
                "        ,sum(case when run is null then 0 else 1 end) as finished_heats" +
                "        ,sum(case when run is null then 1 else 0 end) as unfinished_heats" +
                "    from heats" +
                ")," +
                "runoff_count as " +
                "(" +
                "  select count(*) as total_runoff_count" +
                "        ,sum(case when run is null then 0 else 1 end) as finished_runoffs" +
                "        ,sum(case when run is null then 1 else 0 end) as unfinished_runoffs" +
                "    from runoffs" +
                ")," +
                "car_counts as " +
                "( " +
                "  select count(*) as car_count" +
                "    from cars" +
                ")," +
                "group_counts as " +
                "( " +
                "  select count(*) as group_count" +
                "    from groups" +
                ") " +
                "select a.total_heat_count" +
                "      ,a.finished_heats" +
                "      ,a.unfinished_heats" +
                "      ,round(cast((100.0 * a.finished_heats) / a.total_heat_count as decimal(8,2)),2) as heats_pct_complete" +
                "      ,b.total_runoff_count" +
                "      ,b.finished_runoffs" +
                "      ,b.unfinished_runoffs" +
                "      ,round(cast((100.0 * b.finished_runoffs) / b.total_runoff_count as decimal(8,2)),2) as runoffs_pct_complete" +
                "      ,c.car_count" +
                "      ,d.group_count" +
                "  from heat_count a" +
                "      ,runoff_count b" +
                "      ,car_counts c" +
                "      ,group_counts d" );
       return products.recordsets;
    }
    catch(error)
    {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////
// UnlockRace
// Used to erase the results of a heat or runoff
// and allow it to be rerun
////////////////////////////////////////////////////////////

async function UnlockRace(dbID, RaceType, TrackID, HeatID, Signature)
{

    function CleanseText(input)
    {
        if (typeof input !== 'string')
        {
            return input; // If it's not a string, return as is
        }

        // Escape characters that could be used for SQL injection
        return input
            .replace(/'/g, "''")       // Escape single quotes
            .replace(/"/g, '""')       // Escape double quotes
            .replace(/;/g, '')         // Remove semicolons
            .replace(/--/g, '')        // Remove SQL comments
            .replace(/\\/g, '\\\\')    // Escape backslashes
            .replace(/[\n\r]/g, '');   // Remove newline characters
    }

    try 
    {
         // These values should always be provided
         num_trackID = parseInt(TrackID)
         num_HeatID = parseInt(HeatID)
         num_RaceType = parseInt(RaceType)
         
         // The signature might be anything, so cleanse it before sending
         txt_Signature = CleanseText(Signature)
         
         if (Number.isInteger(dbID) && Number.isInteger(num_trackID) && Number.isInteger(num_HeatID) && Number.isInteger(num_RaceType) )
         {
             if (dbID == 1) 
             {
                 var pool = await sql.connect(dbconfig_cubs);
             }
             else if (dbID == 2) 
             {
                 var pool = await sql.connect(dbconfig_scouts);
             } 
             else
             {
                 throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
             }
             var products = await pool.request()
               .input('RaceType', sql.Int, num_RaceType)
               .input('Track', sql.Int, num_trackID)
               .input('Heat', sql.Int, num_HeatID)
               .input('Signature', sql.VarChar, txt_Signature)
               .execute('dbo.UnlockRace');
             return products.recordsets;
         }
    }
    catch(error)
    {
        console.log(error);
    }
}


////////////////////////////////////////////////////////////
// SaveResults
// Used to save the results of a heat or runoff
////////////////////////////////////////////////////////////

async function SaveResults(dbID, RaceType, TrackID, HeatID, Result1, Result2, Result3, Result4, Result5, Result6, Signature)
{

    function CleanseText(input)
    {
        if (typeof input !== 'string')
        {
            return input; // If it's not a string, return as is
        }

        // Escape characters that could be used for SQL injection
        return input
            .replace(/'/g, "''")       // Escape single quotes
            .replace(/"/g, '""')       // Escape double quotes
            .replace(/;/g, '')         // Remove semicolons
            .replace(/--/g, '')        // Remove SQL comments
            .replace(/\\/g, '\\\\')    // Escape backslashes
            .replace(/[\n\r]/g, '');   // Remove newline characters
    }

    try 
    {
         // These values should always be provided
         num_trackID = parseInt(TrackID)
         num_HeatID = parseInt(HeatID)
         num_RaceType = parseInt(RaceType)
         
         // There should always be at least two result columns
         num_Result1 = parseInt(Result1)
         num_Result2 = parseInt(Result2)
         
         // These depend on the VPH (Vehicles Per Heat) setting, if its an integer, use the integer. otherwise change to a null
         // The actual numbers will be validated inside the called procedure
         if (Number.isInteger(parseInt(Result3))) {
             num_Result3 = parseInt(Result3)
         } else {
             num_Result3 = 'null'
         }
         if (Number.isInteger(parseInt(Result4))) {
             num_Result4 = parseInt(Result4)
         } else {
             num_Result4 = 'null'
         }
         if (Number.isInteger(parseInt(Result5))) {
             num_Result5 = parseInt(Result5)
         } else {
             num_Result5 = 'null'
         }
         if (Number.isInteger(parseInt(Result6))) {
             num_Result6 = parseInt(Result6)
         } else {
             num_Result6 = 'null'
         }
         
         // The signature might be anything, so cleanse it before sending
         txt_Signature = CleanseText(Signature)
         
         if (Number.isInteger(dbID) && Number.isInteger(num_trackID) && Number.isInteger(num_HeatID) && Number.isInteger(num_RaceType) && Number.isInteger(num_Result1) && Number.isInteger(num_Result2) )
         {
             if (dbID == 1) 
             {
                 var pool = await sql.connect(dbconfig_cubs);
             }
             else if (dbID == 2) 
             {
                 var pool = await sql.connect(dbconfig_scouts);
             } 
             else
             {
                 throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
             }
             var products = await pool.request()
               .input('RaceType', sql.Int, num_RaceType)
               .input('Track', sql.Int, num_trackID)
               .input('Heat', sql.Int, num_HeatID)
               .input('Result1', sql.Int, num_Result1)
               .input('Result2', sql.Int, num_Result2)
               .input('Result3', sql.Int, num_Result3)
               .input('Result4', sql.Int, num_Result4)
               .input('Result5', sql.Int, num_Result5)
               .input('Result6', sql.Int, num_Result6)
               .input('Signature', sql.VarChar, txt_Signature)
               .execute('dbo.SaveResults');
             return products.recordsets;
         }
    }
    catch(error)
    {
        console.log(error);
    }
}



module.exports = {
  getVehiclesPerHeat: getVehiclesPerHeat,
  getTracks: getTracks,
  GetRace: GetRace,
  GetAllRaces: GetAllRaces,
  GetUnfinishedHeats: GetUnfinishedHeats,
  GetUnfinishedRunOffs: GetUnfinishedRunOffs,
  CountUnfinishedHeats: CountUnfinishedHeats,
  CountUnfinishedRunOffs: CountUnfinishedRunOffs,
  GetLatestFinishedHeats: GetLatestFinishedHeats,
  GetLatestFinishedRunOffs: GetLatestFinishedRunOffs,
  GetHeatStatsByTrack: GetHeatStatsByTrack,
  GetRunOffStatsByTrack: GetRunOffStatsByTrack,
  GetTrackSummaryStats: GetTrackSummaryStats,
  GetSummaryStats: GetSummaryStats,
  UnlockRace: UnlockRace,
  SaveResults: SaveResults
}