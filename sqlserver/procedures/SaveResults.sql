create procedure dbo.SaveResults
  @RaceType integer,
  @Track integer,
  @Heat integer,
  @Result1 integer,
  @Result2 integer,
  @Result3 integer null,
  @Result4 integer null,
  @Result5 integer null,
  @Result6 integer null,
  @Signature varchar(100)
as
begin
  DECLARE @v_table varchar(10);
  DECLARE @v_audit_table varchar(20);
  DECLARE @SQL NVARCHAR(MAX);
  DECLARE @VPH integer;
  DECLARE @dnf_cnt integer;
  DECLARE @fin_cnt integer;
  DECLARE @dupe_count integer;
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
  
  -- The VehiclesPerHeat value determines if the values should be null or not.

  SELECT @VPH = VehiclesPerHeat
   FROM dbo.settings;
   
  -- Check if VPH is valid
  if @VPH not in(2,3,4,5,6)
  begin
    set @return_code = 2;
  end
   
  -- Check for NULLS when there shouldn't be any:

  if @VPH = 6
  begin
    if @Result6 is null or @Result5 is null or @Result4 is null or @Result3 is null or @Result2 is null or @Result1 is null
    begin
      -- ERROR: Expecting non-null values for all
      set @return_code = 3;
    end
  end

  if @VPH = 5
  begin
    if @Result5 is null or @Result4 is null or @Result3 is null or @Result2 is null or @Result1 is null
    begin
      -- ERROR: Expecting non-null value
      set @return_code = 4;
    end
  end

  if @VPH = 4
  begin
    if @Result4 is null or @Result3 is null or @Result2 is null or @Result1 is null
    begin
      -- ERROR: Expecting non-null value
      set @return_code = 5;
    end
  end

  if @VPH = 3
  begin
    if @Result3 is null or @Result2 is null or @Result1 is null
    begin
      -- ERROR: Expecting non-null value
      set @return_code = 6;
    end
  end

  if @VPH = 2
  begin
    if @Result2 is null or @Result1 is null
    begin
      -- ERROR: Expecting null value
      set @return_code = 7;
    end
  end

  -- Check for NOT NULLS when there should be NULLS

  if @VPH = 5
  begin
    if @Result6 is not null
    begin
      -- ERROR: Expecting null value
      set @return_code = 8;
    end
  end

  if @VPH = 4
  begin
    if @Result5 is not null or @Result6 is not null
    begin
      -- ERROR: Expecting null value
      set @return_code = 9;
    end
  end

  if @VPH = 3
  begin
    if @Result4 is not null or @Result5 is not null or @Result6 is not null
    begin
      -- ERROR: Expecting null value
      set @return_code = 10;
    end
  end

  if @VPH = 2
  begin
    if @Result3 is not null or @Result4 is not null or @Result5 is not null or @Result6 is not null
    begin
      -- ERROR: Expecting null value
      set @return_code = 11;
    end
  end
  
  -- Check for the correct integer values
  
  if @VPH = 6
  begin
    if @Result6 not in(1,2,3,4,5,6,1000)
    or @Result5 not in(1,2,3,4,5,6,1000)
    or @Result4 not in(1,2,3,4,5,6,1000)
    or @Result3 not in(1,2,3,4,5,6,1000)
    or @Result2 not in(1,2,3,4,5,6,1000)
    or @Result1 not in(1,2,3,4,5,6,1000)
    begin
      -- ERROR: Expecting the correct values for all
      set @return_code = 12;
    end
  end

  if @VPH = 5
  begin
    if @Result5 not in(1,2,3,4,5,1000)
    or @Result4 not in(1,2,3,4,5,1000)
    or @Result3 not in(1,2,3,4,5,1000)
    or @Result2 not in(1,2,3,4,5,1000)
    or @Result1 not in(1,2,3,4,5,1000)
    begin
      -- ERROR: Expecting the correct values for all
      set @return_code = 13;
    end
  end

  if @VPH = 4
  begin
    if @Result4 not in(1,2,3,4,1000)
    or @Result3 not in(1,2,3,4,1000)
    or @Result2 not in(1,2,3,4,1000)
    or @Result1 not in(1,2,3,4,1000)
    begin
      -- ERROR: Expecting the correct values for all
      set @return_code = 14;
    end
  end

  if @VPH = 3
  begin
    if @Result3 not in(1,2,3,1000)
    or @Result2 not in(1,2,3,1000)
    or @Result1 not in(1,2,3,1000)
    begin
      -- ERROR: Expecting the correct values for all
      set @return_code = 15;
    end
  end

  if @VPH = 2
  begin
    if @Result2 not in(1,2,1000)
    or @Result1 not in(1,2,1000)
    begin
      -- ERROR: Expecting the correct values for all
      set @return_code = 16;
    end
  end
  
  -- Signature Must be non-null
  if @Signature is null
  begin
    -- Expecting a signature (usually the name & pin)
    set @return_code = 17;
  end
  
  -- Last line of defence against SQL Injection:
  -- Signature must not contain any special characters, only letters and numbers
  -- We just strip them out, and use the result
  SET @CleanSignature = REPLACE(TRANSLATE(@Signature, '!@#$%^&*()_+={}[]|:;"''<>,.?/~`', REPLICATE(' ', 30)), ' ', '');
  
  -- Check for duplicates
  -- If there are one or more 1000 entries, we don't want to trigger the duplicate logic
  create table #ResultTemp
  (
     result_val integer
  );
  insert Into #ResultTemp select @Result1;
  insert Into #ResultTemp select @Result2;
  insert Into #ResultTemp select @Result3;
  insert Into #ResultTemp select @Result4;
  insert Into #ResultTemp select @Result5;
  insert Into #ResultTemp select @Result6;
  
  select @dupe_count = count(*)
    from (
            select result_val
                  ,count(*) as cnt
              from #ResultTemp
             where result_val in(1,2,3,4,5,6)
             group by result_val
            having count(*) > 1
         ) a
  ;
  
  -- We expect 0 duplicates:
  if @dupe_count > 0
  begin
    set @return_code = 18;
  end;  
  
  -- If there's a single 1000 result present (i.e. DNF), then the max position chosen should be 
  -- one less than the VPH.
  -- i.e. for two cars, a 1000 would mean the other car automatically came first 
  -- (no other position is possible)
  -- For 3 cars, the other two can only be in 1st or 2nd, and so on.
  -- In general, the max position can only be: VPH - DNF
  select @dnf_cnt = sum(case when result_val = 1000 then 1 else 0 end)
        ,@fin_cnt = max(case when result_val in(1,2,3,4,5,6) then result_val else 0 end)
    from #ResultTemp
  ;
  
  if @dnf_cnt > 0
  begin
    if @fin_cnt > @VPH - @dnf_cnt
    begin
      set @return_code = 19;
    end
  end
  
  -- If we get to this point, and the data is good, we can proceed with insert and update
  if @return_code = 0
  begin
    -- Insert into the AUDIT table
    SET @SQL = 'insert into ' + @v_audit_table + '([Track], [Heat], [Lane1], [Lane2], [Lane3], [Lane4], [Lane5], [Lane6], [Run], [Result1], [Result2], [Result3], [Result4], [Result5], [Result6], [Timestamp], [Signature])' +
               'select [Track], [Heat], [Lane1], [Lane2], [Lane3], [Lane4], [Lane5], [Lane6], 1, ' + COALESCE(CAST(@Result1 AS NVARCHAR(5)),'NULL') + ',' + COALESCE(CAST(@Result2 AS NVARCHAR(5)),'NULL') + ',' + COALESCE(CAST(@Result3 AS NVARCHAR(5)),'NULL') + ',' + COALESCE(CAST(@Result4 AS NVARCHAR(5)),'NULL') + ',' + COALESCE(CAST(@Result5 AS NVARCHAR(5)),'NULL') + ',' + COALESCE(CAST(@Result6 AS NVARCHAR(5)),'NULL') + ', GETDATE(),' + '''' + @CleanSignature + '''' +
               '  from ' + @v_table + 
               ' where track = ' + CAST(@Track AS NVARCHAR(5)) +
               '   and heat = ' + CAST(@Heat AS NVARCHAR(5))
    ;
    EXEC(@SQL);
    
    -- Update the main table
    SET @SQL = 'update ' + @v_table + 
               '   set [run] = 1,' +
               '       [Result1] = ' + COALESCE(CAST(@Result1 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Result2] = ' + COALESCE(CAST(@Result2 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Result3] = ' + COALESCE(CAST(@Result3 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Result4] = ' + COALESCE(CAST(@Result4 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Result5] = ' + COALESCE(CAST(@Result5 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Result6] = ' + COALESCE(CAST(@Result6 AS NVARCHAR(5)),'NULL') + ',' +
               '       [Signature] = ' + '''' + @CleanSignature + '''' + 
               ' where track = ' + CAST(@Track AS NVARCHAR(5)) +
               '   and heat = ' + CAST(@Heat AS NVARCHAR(5))
    ;
    EXEC(@SQL);
  end
  
  -- return the code to the caller
  select 'return_code' = @return_code
end

