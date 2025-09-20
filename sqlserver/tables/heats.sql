SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Heats](
	[Track] [int] NOT NULL,
	[Heat] [int] NOT NULL,
	[Lane1] [int] NULL,
	[Lane2] [int] NULL,
	[Lane3] [int] NULL,
	[Lane4] [int] NULL,
	[Lane5] [int] NULL,
	[Lane6] [int] NULL,
	[Run] [bit] NULL,
	[Result1] [int] NULL,
	[Result2] [int] NULL,
	[Result3] [int] NULL,
	[Result4] [int] NULL,
	[Result5] [int] NULL,
	[Result6] [int] NULL,
	[Signature] [varchar](100) NULL,
 CONSTRAINT [U_Heats] UNIQUE NONCLUSTERED 
(
	[Track] ASC,
	[Heat] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

