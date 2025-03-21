import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    padding: '2rem',
    backgroundColor: '#f5f6fa',
    minHeight: '100vh'
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)'
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  chartTitle: {
    marginBottom: '1.5rem',
    color: '#2c3e50',
    fontWeight: '600'
  }
}));