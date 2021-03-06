/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import BetModal from './BetModal';
import betService from '../services/betService';
import gameService from '../services/gameService';
import teamService from '../services/teamService';
import statService from '../services/statService';
import NavBar from '../components/NavBar';

function BotBet(props) {
  const [betStats, setBetStats] = useState({ total_amount: 0, total_count: 0 });
  const [awayBetStats, setAwayBetStats] = useState({ total_amount: 0, total_count: 0, percent: 0 });
  const [homeBetStats, setHomeBetStats] = useState({ total_amount: 0, total_count: 0, percent: 0 });
  const [currentGame, setCurrentGame] = useState({
    status: '', id: 0, winner: 0, start_time: '',
  });
  const [awayOdds, setAwayOdds] = useState();
  const [homeOdds, setHomeOdds] = useState();
  const [awayTeam, setAwayTeam] = useState({
    name: 'Away Team', image_url: 'placeholder', team_id: 0,
  });
  const [homeTeam, setHomeTeam] = useState({
    name: 'Home Team', image_url: 'placeholder', team_id: 0,
  });

  function executeBet() {
    betService.getBetsByGameId(props.match.params.id).then((data) => {
      let trailingAmount = 0;
      let trailingCount = 0;
      let awayBetCount = 0;
      let homeBetCount = 0;
      let homeBetAmount = 0;
      let awayBetAmount = 0;

      data.forEach((b) => {
        if (b.type === 'bot') {
          trailingAmount += b.amount;
          trailingCount += 1;
          if (b.team_id == awayTeam.team_id) {
            awayBetCount += 1;
            awayBetAmount += b.amount;
          } else if (b.team_id == homeTeam.team_id) {
            homeBetCount += 1;
            homeBetAmount += b.amount;
          }
        }
      });

      setAwayBetStats({ total_amount: awayBetAmount, total_count: awayBetCount });
      setHomeBetStats({ total_amount: homeBetAmount, total_count: homeBetCount });
      setBetStats({ total_amount: trailingAmount, total_count: trailingCount });
    });
  }

  useEffect(() => {
    gameService.getGameById(props.match.params.id).then(async (game) => {
      setCurrentGame({
        home_odds: game.home_odds,
        away_odds: game.away_odds,
        status: game.status,
        id: game.game_id,
        winner: game.winner,
        start_time: game.start_time,
      });

      if (!game.home_odds || !game.away_odds) {
        gameService.getGameOdds(game.game_id).then((data) => {
          if (!data.error) {
            setAwayOdds(data.away_odds);
            setHomeOdds(data.home_odds);
          }
        });
      } else {
        setHomeOdds(game.home_odds);
        setAwayOdds(game.away_odds);
      }

      teamService.getTeamById(game.away_team_id).then((away) => {
        setAwayTeam({
          name: away[0].name,
          image_url: away[0].image_url,
          team_id: away[0].team_id,
        });
      });

      statService.getTeamStats(game.away_team_id).then((away) => {
        const { teamStats } = away;
        setAwayTeam((oldAway) => ({ ...oldAway, wins: teamStats.wins, losses: teamStats.losses }));
      });

      teamService.getTeamById(game.home_team_id).then((home) => {
        setHomeTeam({
          name: home[0].name,
          image_url: home[0].image_url,
          team_id: home[0].team_id,
        });
      });

      statService.getTeamStats(game.home_team_id).then((home) => {
        const { teamStats } = home;
        setHomeTeam((oldHome) => ({ ...oldHome, wins: teamStats.wins, losses: teamStats.losses }));
      });
    });
  }, []);

  useEffect(() => {
    executeBet();
  }, [awayTeam, homeTeam]);

  let BotPickHome = null;
  if (homeOdds && awayOdds) {
    if (homeOdds < awayOdds) {
      BotPickHome = (<h3>The Bot&apos;s Pick!</h3>);
    }
  }

  let BotPickAway = null;
  if (homeOdds && awayOdds) {
    if (awayOdds < homeOdds) {
      BotPickAway = (<h3>The Bot&apos;s Pick!</h3>);
    }
  }

  return (
    <div>
      <NavBar pageName="Beat the Bot" />
      <Container
        maxWidth="md"
        style={{
          background: 'white', textAlign: 'center', marginTop: '50px', paddingTop: '20px',
        }}
      >
        <div className="row">
          <div className="col-md">
            <strong>Home Team</strong>
            <br />
            {currentGame.status === 'Final' && homeTeam.team_id === currentGame.winner && (
              <p>Winner!</p>
            )}
            <img src={`${homeTeam.image_url}`} alt="Home Team Logo" width="50" height="50" />
            <p>{homeTeam.name}</p>
            <p>{(homeTeam.wins && homeTeam.losses) ? (`${homeTeam.wins} W - ${homeTeam.losses} L`) : null}</p>
            {BotPickHome}
          </div>
          <div className="col-md">
            <img alt="Bot Icon" width="auto" height="80" src="/BotIcon.jpg" />
            <h3>VS</h3>
            <span>
              {(currentGame.start_time)
                ? (new Date(currentGame.start_time).toLocaleDateString()) : null}
            </span>
            <br />
            <span>
              {(currentGame.start_time)
                ? (new Date(currentGame.start_time).toLocaleTimeString())
                : null}
            </span>
            <br />
            <br />
            <BetModal finishedBettingHandler={executeBet} gameID={currentGame.id} team1={{ name: `${homeTeam.name}`, id: `${homeTeam.team_id}` }} team2={{ name: `${awayTeam.name}`, id: `${awayTeam.team_id}` }} type="bot" />
          </div>
          <div className="col-md">
            <strong>Away Team</strong>
            <br />
            {currentGame.status === 'Final' && awayTeam.team_id === currentGame.winner && (
              <p>Winner!</p>
            )}
            <img src={awayTeam.image_url} alt="Away Team Logo" width="50" height="50" />
            <p>{awayTeam.name}</p>
            <p>{(awayTeam.wins && awayTeam.losses) ? (`${awayTeam.wins} W - ${awayTeam.losses} L`) : null}</p>
            {BotPickAway}
          </div>
        </div>
        <hr />
        <div className="row">
          <h3 style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '30px' }}>Current Betting Stats</h3>
        </div>
        <div className="row">
          <div className="col-md">
            <p>
              {`Total Shredits Bet: ${homeBetStats.total_amount} `}
              <br />
              { ((homeBetStats.total_amount / betStats.total_amount) * 100)
                ? (`(${parseFloat((homeBetStats.total_amount / betStats.total_amount) * 100).toFixed(2)} %)`)
                : null }
            </p>
            <p>
              {`Number of Bets: ${homeBetStats.total_count} bet(s) `}
              <br />
              { ((homeBetStats.total_count / betStats.total_count) * 100)
                ? (`(${parseFloat((homeBetStats.total_count / betStats.total_count) * 100).toFixed(2)} %)`)
                : null }
            </p>
          </div>
          <div className="col-md">
            <p>
              {`Total Bets: ${betStats.total_count} bet(s)`}
            </p>
            <p>
              {`Total Shredits Bet: ${betStats.total_amount}`}
            </p>
          </div>
          <div className="col-md">
            <p>
              {`Total Shredits Bet: ${awayBetStats.total_amount} `}
              <br />
              { ((awayBetStats.total_amount / betStats.total_amount) * 100)
                ? (`\n(${parseFloat((awayBetStats.total_amount / betStats.total_amount) * 100).toFixed(2)} %)`)
                : null }
            </p>
            <p>
              {`Number of Bets: ${awayBetStats.total_count} bet(s)`}
              <br />
              { ((awayBetStats.total_count / betStats.total_count) * 100)
                ? (`(${parseFloat((awayBetStats.total_count / betStats.total_count) * 100).toFixed(2)} %)`)
                : null }
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default BotBet;
