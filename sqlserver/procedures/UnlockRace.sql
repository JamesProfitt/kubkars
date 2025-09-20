create procedure dbo.UnlockRace
  @RaceType integer,
  @Track integer,
  @Heat integer,
  @Signature varchar(100)
as
begin
  DECLARE @v_table varchar(10);
  DECLARE @v_audit_table varchar(20);
  DECLARE @SQL NVARCHAR(MAX);
  DECLARE @CleanSignature varchar(100);
  DECLARE @return_code integer;

  -- Start by assuming no errors
  set @return_code = 0;
  
  -- Set the table names based on the RaceType

  if @RaceType = 1
  begin
    -- HEATS
    set @v_table = 'heats';
    set @v_audit_table = 'heataudit';
  end
  else if @RaceType = 2
  begin
    -- RUNOFFS
    set @v_table = 'runoffs';
    set @v_audit_table = 'runoffaudit';
  end
  else 
  begin
    -- RaceType is invalid
    set @return_code = 1;
  end;
  
  -- Signature Must be non-null
  if @Signature is null
  begin
    -- Expecting a signature (usually the name & pin)
    set @return_code = 2;
  end
  
  -- Last line of defence against SQL Injection:
  -- Signature must not contain any special characters, only letters and numbers
  -- We just strip them out, and use the result
  SET @CleanSignature = REPLACE(TRANSLATE(@Signature, '!@#$%^&*()_+={}[]|:;"''<>,.?/~`', REPLICATE(' ', 30)), ' ', '');
  
  -- If we get to this point, and the data is good, we can proceed with insert and update
  if @return_code = 0
  begin
    -- Insert into the AUDIT table
    SET @SQL = 'insert into ' + @v_audit_table + '([Track], [Heat], [Lane1], [Lane2], [Lane3], [Lane4], [Lane5], [Lane6], [Run], [Result1], [Result2], [Result3], [Result4], [Result5], [Result6], [Timestamp], [Signature])' +
               'select [Track], [Heat], [Lane1], [Lane2], [Lane3], [Lane4], [Lane5], [Lane6], NULL, NULL, NULL, NULL, NULL, NULL, NULL , GETDATE(),' + '''' + @CleanSignature + '''' +
               '  from ' + @v_table + 
               ' where track = ' + CAST(@Track AS NVARCHAR(5)) +
               '   and heat = ' + CAST(@Heat AS NVARCHAR(5))
    ;
    EXEC(@SQL);
    
    -- Update the main table
    SET @SQL = 'update ' + @v_table + 
               '   set [run] = NULL,' +
               '       [Result1] = NULL,' +
               '       [Result2] = NULL,' +
               '       [Result3] = NULL,' +
               '       [Result4] = NULL,' +
               '       [Result5] = NULL,' +
               '       [Result6] = NULL,' +
               '       [Signature] = ' + '''' + @CleanSignature + '''' + 
               ' where track = ' + CAST(@Track AS NVARCHAR(5)) +
               '   and heat = ' + CAST(@Heat AS NVARCHAR(5))
    ;
    EXEC(@SQL);
  end
  
  -- return the code to the caller
  select 'return_code' = @return_code
end


