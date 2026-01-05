const sql = require('mssql');

const { dbconfig_cubs } = require('@config/dbconfig_cubs');
const { dbconfig_scouts } = require('@config/dbconfig_scouts');

const cubs_pool = new sql.ConnectionPool(dbconfig_cubs);
const scouts_pool = new sql.ConnectionPool(dbconfig_scouts);

// Initiate a connection to the cubs connection pool
// Taken from https://github.com/tediousjs/node-mssql/issues/924

cubs_pool.connect().then(function(cubs_pool) {
  
    console.log('Cubs Connected');
    
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('5 second timeout, running query')
        console.log(cubs_pool.healthy ? 'cubs pool is healthy' : 'cubs pool is unhealthy')
        resolve(cubs_pool)
      }, 5000)
   
    })
  
}).then(cubs_pool => {
  
    // run a simple SQL query, log the result set if successful or the error if not, return the pool
    
    console.log('Cubs Query: ');
    return cubs_pool.request().query('SELECT DB_NAME()').then(result => console.log(result.recordset)).catch(e => {

        console.error('cubs query error', e)

    }).then(() => cubs_pool)

}).then(cubs_pool => {
  
    console.log(cubs_pool.healthy ? 'cubs pool is healthy' : 'cubs pool is unhealthy')
    // close the pool
    //return cubs_pool ? cubs_pool.close() : null
    return cubs_pool;
    
}).catch(function(err){
  
    console.log('Error creating the cubs pool: ', err);

});

// Initiate a connection to the scouts connection pool

scouts_pool.connect().then(function(pool) {
  
    console.log('Scouts Connected');
    
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('5 second timeout, running query')
        console.log(scouts_pool.healthy ? 'scouts pool is healthy' : 'scouts pool is unhealthy')
        resolve(scouts_pool)
      }, 5000)
   
    })
  
}).then(scouts_pool => {
  
    // run a simple SQL query, log the result set if successful or the error if not, return the pool
    
    console.log('Scouts Query: ');
    return scouts_pool.request().query('SELECT DB_NAME()').then(result => console.log(result.recordset)).catch(e => {

        console.error('scouts query error', e)

    }).then(() => scouts_pool)

}).then(scouts_pool => {
  
    console.log(scouts_pool.healthy ? 'scouts pool is healthy' : 'scouts pool is unhealthy')
    // close the pool
    //return scouts_pool ? scouts_pool.close() : null
    return scouts_pool;
    
}).catch(function(err){
  
    console.log('Error creating the scouts pool: ', err);

});

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
    const querytxt = "select VehiclesPerHeat " + 
                     "  from settings ";
    try 
    {
       if (dbID == 1) 
       {
           var products = await cubs_pool.request().query(querytxt);
       }
       else if (dbID == 2) 
       {
           var products = await scouts_pool.request().query(querytxt);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       
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
    const querytxt = "select track " + 
                     "  from tracks " +
                     " union " +
                     "select track " + 
                     "  from runofftracks ";
                     
    try 
    {
       if (dbID == 1) 
       {
           var products = await cubs_pool.request().query(querytxt);
       }
       else if (dbID == 2) 
       {
           var products = await scouts_pool.request().query(querytxt);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
       
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
////////////////////////////////////////////////////////////

async function GetRace(dbID, TrackID, HeatID, RunType)
{
    
    const querytxt = "with allrows as ( " +
                     "select 1 as run_type" + 
                     "      ,h.track" + 
                     "      ,h.heat" + 
                     "      ,coalesce(h.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(h.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(h.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(h.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(h.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(h.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(c1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(c2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(c3.Name,'na') as lane3_driver" + 
                     "      ,coalesce(c4.Name,'na') as lane4_driver" + 
                     "      ,coalesce(c5.Name,'na') as lane5_driver" + 
                     "      ,coalesce(c6.Name,'na') as lane6_driver" + 
                     "      ,coalesce(c1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(c2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(c3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(c4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(c5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(c6.[Group],'na') as lane6_group" + 
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
                     "      ,coalesce(r.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(r.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(r.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(r.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(r.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(r.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(rc1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(rc2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane3_driver" + 
                     "      ,coalesce(rc4.Name,'na') as lane4_driver" + 
                     "      ,coalesce(rc5.Name,'na') as lane5_driver" + 
                     "      ,coalesce(rc6.Name,'na') as lane6_driver" + 
                     "      ,coalesce(rc1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(rc2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(rc3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(rc4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(rc5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(rc6.[Group],'na') as lane6_group" + 
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
                     "   and r.run is null" +
                     ") " +
                     "select * " +
                     "  from allrows " +
                     " where run_type = @RunType ";
    
    try 
    {
       num_trackID = parseInt(TrackID);
       num_HeatID = parseInt(HeatID);
       num_RunType = parseInt(RunType);
       if (Number.isInteger(num_trackID) & Number.isInteger(num_HeatID) & Number.isInteger(num_RunType))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .input('HeatID', sql.Int, num_HeatID)
                 .input('RunType', sql.Int, num_RunType)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .input('HeatID', sql.Int, num_HeatID)
                 .input('RunType', sql.Int, num_RunType)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
// This isn't being used currently.
////////////////////////////////////////////////////////////

async function GetAllRaces(dbID, TrackID)
{
    
    const querytxt = "select 1 as run_type" + 
                     "      ,h.track" + 
                     "      ,h.heat" + 
                     "      ,coalesce(h.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(h.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(h.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(h.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(h.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(h.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(c1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(c2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(c3.Name,'na') as lane3_driver" + 
                     "      ,coalesce(c4.Name,'na') as lane4_driver" + 
                     "      ,coalesce(c5.Name,'na') as lane5_driver" + 
                     "      ,coalesce(c6.Name,'na') as lane6_driver" + 
                     "      ,coalesce(c1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(c2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(c3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(c4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(c5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(c6.[Group],'na') as lane6_group" + 
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
                     "      ,coalesce(r.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(r.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(r.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(r.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(r.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(r.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(rc1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(rc2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane3_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane4_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane5_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane6_driver" + 
                     "      ,coalesce(rc1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(rc2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(rc3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(rc4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(rc5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(rc6.[Group],'na') as lane6_group" + 
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
                     " order by run_type, track, heat ";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
////////////////////////////////////////////////////////////

async function GetUnfinishedHeats(dbID, TrackID)
{
    
    const querytxt = "select h.track" + 
                     "      ,h.heat" + 
                     "      ,coalesce(h.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(h.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(h.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(h.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(h.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(h.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(c1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(c2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(c3.Name,'na') as lane3_driver " + 
                     "      ,coalesce(c4.Name,'na') as lane4_driver " + 
                     "      ,coalesce(c5.Name,'na') as lane5_driver " + 
                     "      ,coalesce(c6.Name,'na') as lane6_driver " + 
                     "      ,coalesce(c1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(c2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(c3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(c4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(c5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(c6.[Group],'na') as lane6_group" + 
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
                     " order by h.heat";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
////////////////////////////////////////////////////////////

async function GetUnfinishedRunOffs(dbID, TrackID)
{
    
    const querytxt = "select r.track" + 
                     "      ,r.heat" + 
                     "      ,coalesce(r.lane1,-1) as lane1_carNumber" + 
                     "      ,coalesce(r.lane2,-1) as lane2_carNumber" + 
                     "      ,coalesce(r.lane3,-1) as lane3_carNumber" + 
                     "      ,coalesce(r.lane4,-1) as lane4_carNumber" + 
                     "      ,coalesce(r.lane5,-1) as lane5_carNumber" + 
                     "      ,coalesce(r.lane6,-1) as lane6_carNumber" + 
                     "      ,coalesce(rc1.Name,'na') as lane1_driver" + 
                     "      ,coalesce(rc2.Name,'na') as lane2_driver" + 
                     "      ,coalesce(rc3.Name,'na') as lane3_driver " + 
                     "      ,coalesce(rc4.Name,'na') as lane4_driver " + 
                     "      ,coalesce(rc5.Name,'na') as lane5_driver " + 
                     "      ,coalesce(rc6.Name,'na') as lane6_driver " + 
                     "      ,coalesce(rc1.[Group],'na') as lane1_group" + 
                     "      ,coalesce(rc2.[Group],'na') as lane2_group" + 
                     "      ,coalesce(rc3.[Group],'na') as lane3_group" + 
                     "      ,coalesce(rc4.[Group],'na') as lane4_group" + 
                     "      ,coalesce(rc5.[Group],'na') as lane5_group" + 
                     "      ,coalesce(rc6.[Group],'na') as lane6_group" + 
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
                     " order by r.heat";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "select count(*) as total_heat_count" +
                     "      ,sum(case when run is null then 0 else 1 end) as finished_heats" +
                     "      ,sum(case when run is null then 1 else 0 end) as unfinished_heats" +
                     "  from Heats h " + 
                     " where Track = @TrackID ";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "  select count(*) as total_runoff_count" +
                     "        ,sum(case when run is null then 0 else 1 end) as finished_runoffs" +
                     "        ,sum(case when run is null then 1 else 0 end) as unfinished_runoffs" +
                     "    from runoffs" +
                     "   where Track = @TrackID ";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "select top 5 track, heat" +
                     "  from Heats h " + 
                     " where Track = @TrackID " +
                     "   and run = 1 " +
                     " order by heat desc";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "select top 5 track, heat" +
                     "  from runoffs h " + 
                     " where Track = @TrackID " +
                     "   and run = 1 " +
                     " order by heat desc";
    
    try 
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "with heat_count as " +
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
                     "  from heat_count a";
    
    try 
    {
       if (dbID == 1) 
       {
           var products = await cubs_pool.request()
             .query(querytxt);
       }
       else if (dbID == 2) 
       {
           var products = await scouts_pool.request()
             .query(querytxt);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
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
    
    const querytxt = "with runoff_count as " +
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
                     "  from runoff_count a";
    
    try 
    {
       if (dbID == 1) 
       {
           var products = await cubs_pool.request()
             .query(querytxt);
       }
       else if (dbID == 2) 
       {
           var products = await scouts_pool.request()
             .query(querytxt);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
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
    
    const querytxt = "with heat_count as " +
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
                     "      ,next_runoff d";
    
    try
    {
       num_trackID = parseInt(TrackID)
       if (Number.isInteger(num_trackID))
       {
           if (dbID == 1) 
           {
               var products = await cubs_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           }
           else if (dbID == 2) 
           {
               var products = await scouts_pool.request()
                 .input('TrackID', sql.Int, num_trackID)
                 .query(querytxt);
           } 
           else
           {
               throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
           }
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
    
    const querytxt = "with heat_count as " +
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
                     "      ,group_counts d";
    
    try 
    {
       if (dbID == 1) 
       {
           var products = await cubs_pool.request()
             .query(querytxt);
       }
       else if (dbID == 2) 
       {
           var products = await scouts_pool.request()
             .query(querytxt);
       } 
       else
       {
           throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
       }
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
                 var products = await cubs_pool.request()
                   .input('RaceType', sql.Int, num_RaceType)
                   .input('Track', sql.Int, num_trackID)
                   .input('Heat', sql.Int, num_HeatID)
                   .input('Signature', sql.VarChar, txt_Signature)
                   .execute('dbo.UnlockRace');             }
             else if (dbID == 2) 
             {
                 var products = await scouts_pool.request()
                   .input('RaceType', sql.Int, num_RaceType)
                   .input('Track', sql.Int, num_trackID)
                   .input('Heat', sql.Int, num_HeatID)
                   .input('Signature', sql.VarChar, txt_Signature)
                   .execute('dbo.UnlockRace');             } 
             else
             {
                 throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
             }
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
             num_Result3 = null
         }
         if (Number.isInteger(parseInt(Result4))) {
             num_Result4 = parseInt(Result4)
         } else {
             num_Result4 = null
         }
         if (Number.isInteger(parseInt(Result5))) {
             num_Result5 = parseInt(Result5)
         } else {
             num_Result5 = null
         }
         if (Number.isInteger(parseInt(Result6))) {
             num_Result6 = parseInt(Result6)
         } else {
             num_Result6 = null
         }
         
         // The signature might be anything, so cleanse it before sending
         txt_Signature = CleanseText(Signature)
         
         if (Number.isInteger(dbID) && Number.isInteger(num_trackID) && Number.isInteger(num_HeatID) && Number.isInteger(num_RaceType) && Number.isInteger(num_Result1) && Number.isInteger(num_Result2) )
         {
             if (dbID == 1) 
             {
                 var products = await cubs_pool.request()
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
             }
             else if (dbID == 2) 
             {
                 var products = await scouts_pool.request()
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
             } 
             else
             {
                 throw "dbID invalid, expecting 1 or 2. The provided value was: " + dbID;
             }
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