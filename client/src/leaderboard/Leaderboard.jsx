/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import {
  TableContainer, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, IconButton,
  TableFooter, TablePagination, ListItemAvatar,
}
  from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { useSelector } from 'react-redux';
import styles from './Leaderboard.module.css';
import userService from '../services/userService';
import User from './users/User';
import NavBar from '../components/NavBar';
import { selectUser } from '../store/slices/userSlice';

const useStyles = makeStyles(() => ({
  root: {
    flexShrink: 0,
    marginLeft: '16px',
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles();
  const theme = useTheme();
  const {
    count, page, rowsPerPage, onChangePage,
  } = props;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

function Leaderboard() {
  const user = useSelector(selectUser);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [currRank, setCurrRank] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUsers = async (id) => {
    await userService.getUsers(id).then((res) => {
      setUsers(res.usersRank);
      setCurrRank(res.rank);
    });
  };

  // eslint-disable-next-line arrow-body-style
  const mapFunction = (row) => {
    return (<User key={row.user._id} info={row.user} index={row.rank} />);
  };

  useEffect(() => {
    getUsers(user._id);
  }, [user._id]);

  const numberWithCommas = (x) => {
    if (x) {
      return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    }
    return null;
  };

  let currTable = null;
  if (currRank) {
    currTable = (
      <TableRow className={styles.currUser}>
        <TableCell className={styles.currUserProps} align="center">{currRank}</TableCell>
        <TableCell className={styles.currUserProps} align="center">
          <ListItemAvatar>
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }} className="MuiAvatar-root MuiAvatar-circle">
              <img alt="User" src={user.profile_image} className="MuiAvatar-img" referrerPolicy="no-referrer" />
            </div>
          </ListItemAvatar>
        </TableCell>
        <TableCell className={styles.currUserProps} align="center">{user.name}</TableCell>
        <TableCell className={styles.currUserProps} align="center">{`${numberWithCommas(user.shreddit_balance)}`}</TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <NavBar pageName="Leaderboard" />
      <div className={styles.page}>
        <TableContainer className={styles.tableContainer} component={Paper}>
          <Table className={styles.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Rank:</TableCell>
                <TableCell align="center">Profile Image:</TableCell>
                <TableCell align="center">User:</TableCell>
                <TableCell align="center">Total Shredits:</TableCell>
              </TableRow>
              {currTable}
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : users
              ).map(mapFunction)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[9, 10, 25]}
                  colSpan={3}
                  count={users.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' },
                    native: true,
                  }}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

export default Leaderboard;
