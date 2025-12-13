import { Request, Response } from "express";


export const getGlobalLeaderboard = (req: Request, res: Response) => {
  const leaderboard = res.advancedResults?.data.map(
    (user: any, index: number) => ({
      rank: index + 1,
      name: user.name,
      score: user.totalScore,
      challengesCompleted: user.challengesCompleted || 0,
    })
  );

  res.status(200).json({
    success: true,
    count: leaderboard.length,
    data: leaderboard,
  });
};
