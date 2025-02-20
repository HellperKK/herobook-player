import styled from "@emotion/styled";

const StyledButton = styled.button`
  color: ${(props) => props.color};
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 0;
  margin: 10px 0;
  background-color: #00000064;
  width: 200px;
  border-radius: 15px;
  text-align: center;

  & blockquote {
    margin: 0;
  }
`;

export default StyledButton;
