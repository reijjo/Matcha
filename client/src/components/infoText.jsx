import PropTypes from "prop-types";

// const Notification = ({ message }) => {
function InfoText({ message }) {
  if (message === null) {
    return null;
  }
  return <div className="added" >{message}</div>;
}

export default InfoText;

InfoText.propTypes = {
  message: PropTypes.string,
};

InfoText.defaultProps = {
  message: "",
};
