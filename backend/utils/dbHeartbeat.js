const { pool } = require("../config/db");

function startDbHeartbeat(){

  setInterval(async()=>{

    try{

      await pool.query(
        "SELECT 1"
      );

      console.log(
        "[DB_HEARTBEAT] OK"
      );

    }catch(err){

      console.error(
        "[DB_HEARTBEAT]",
        err.message
      );

    }

  },300000);

}

module.exports=startDbHeartbeat;
