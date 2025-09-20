SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Settings](
	[TrackCount] [int] NULL,
	[ScoringSystem] [int] NOT NULL,
	[VehiclesPerHeat] [int] NULL,
	[VehiclesPerTrack] [int] NULL,
	[RaceRefreshRate] [int] NULL,
	[RunoffRefreshRate] [int] NULL,
	[RunoffCutoffNumber] [int] NULL,
	[UseTieredRunoffs] [bit] NULL,
	[ShowBothScores] [bit] NULL,
 CONSTRAINT [U_Settings] UNIQUE NONCLUSTERED 
(
	[ScoringSystem] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- A DEFAULT insert to start

INSERT INTO [dbo].[Settings]
           ([TrackCount]
           ,[ScoringSystem]
           ,[VehiclesPerHeat]
           ,[VehiclesPerTrack]
           ,[RaceRefreshRate]
           ,[RunoffRefreshRate]
           ,[RunoffCutoffNumber]
           ,[UseTieredRunoffs]
           ,[ShowBothScores])
     VALUES
           (5   -- TrackCount
           ,3   -- ScoringSystem
           ,2   -- VehiclesPerHeat
           ,20  -- VehiclesPerTrack
           ,30  -- RaceRefreshRate
           ,30  -- RunoffRefreshRate
           ,3   -- RunoffCutoffNumber
           ,0   -- UseTieredRunoffs
           ,0   -- ShowBothScores
           )
GO


