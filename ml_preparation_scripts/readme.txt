1. run the iscout-data-generator
2. run create table as select script - ml_data (mlscript.sql -> brain repo)
3. export ml_data to csv
4. run python ml script on ml_data - export results to csv
   and insert to DB - clustering_results
5. run ml_results_interpeter.js - ml_distance table created.

Thats it! now run the iscout server and the iscout brain and everything is set!