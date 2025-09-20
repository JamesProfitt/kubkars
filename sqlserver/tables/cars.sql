/****** Object:  Table [dbo].[Cars]    Script Date: 2025-08-05 11:10:33 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Cars](
	[UniqueId] [varchar](100) NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Group] [varchar](100) NOT NULL,
	[Year] [int] NULL,
	[Present] [bit] NULL,
	[CarNumber] [int] NULL,
	[Qualified] [bit] NULL,
	[Weight] [float] NULL,
 CONSTRAINT [U_Cars] UNIQUE NONCLUSTERED 
(
	[UniqueId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO