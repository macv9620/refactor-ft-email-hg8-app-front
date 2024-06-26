import { useState, useEffect } from "react";
import { Avatar, Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import ListEmail from "../components/Home/ListEmail";
import ViewEmail from "../components/Home/ViewEmail";
import ModalEmail from "../components/NewEmail/ModalEmail";
import { useStateProvider } from "../context/StateContext";
import { reducerCase } from "../context/constants";
import emailService from "../services/emailService";
import EmailType from "../types/EmailType";

const Home = () => {
  const { dispatch } = useStateProvider();
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [emailSelected, setEmailSelected] = useState<EmailType | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userMail, setUserMail] = useState<string>("");
  const [updateMessages, setUpdateMessages] = useState<boolean>(false);
  const [showMessagesFrom, setShowMessagesFrom] = useState<"inbox" | "sent">("inbox");
  const navigate = useNavigate();

  const handleEmailSelected = (id: string) => {
    const email = emails.find((email) => email.id === id);
    if (email) setEmailSelected(email);
  };

  useEffect(() => {

    setEmailSelected(null)
    if(showMessagesFrom === 'inbox'){
      console.log("Traer mensajes inbox")
      const fetchInboxEmails = async () => {
        try {
          const res = await emailService.getInboxEmails();
          console.log(res);
  
          const sortedEmails = res.data.sort(
            (a: { timestamp: string }, b: { timestamp: string }) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setEmails(sortedEmails);
        } catch (error) {
          console.log(error);
          toast("No has iniciado sesion", { type: "error" });
          navigate("/login");
        }
      };

      fetchInboxEmails();
    }

    if(showMessagesFrom === 'sent'){
      console.log("Traer mensajes sent")
      const fetchSentEmails = async () => {
        try {
          const res = await emailService.getSentEmails();
          console.log(res);
  
          const sortedEmails = res.data.sort(
            (a: { timestamp: string }, b: { timestamp: string }) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setEmails(sortedEmails);
        } catch (error) {
          console.log(error);
          toast("No has iniciado sesion", { type: "error" });
          navigate("/login");
        }
      };

      fetchSentEmails();
    }


    const getUserInfoFromLocalStorage = () => {
      const userNameFromLocal = localStorage
        .getItem("userName")
        ?.toString()
        .replace('"', "")
        .replace('"', "");
      const userMailFromLocal = localStorage
        .getItem("email")
        ?.replace('"', "")
        .replace('"', "");
      if (userNameFromLocal && userMailFromLocal) {
        setUserName(userNameFromLocal);
        setUserMail(userMailFromLocal);
      }
    };

    getUserInfoFromLocalStorage();
  }, [navigate, updateMessages, showMessagesFrom]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("email");
    toast("Sesión cerrada", { type: "success" });
    dispatch({ type: reducerCase.SET_USER_INFO, userInfo: "" });
    navigate("/login");
  };

  const handleButtonClick = (buttonType: "inbox" | "sent") => {
    setShowMessagesFrom(buttonType);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row justify-between p-3 text-center mb-2">
        <div className="text-md text-blue-500 font-bold">
          <p className="text-center pl-9">App Messages</p>
        </div>
        <div className="flex gap-2">
          <Button color="danger" variant={showMessagesFrom === "inbox" ? "solid" : "faded"} onClick={() => handleButtonClick("inbox")}>
            Recibidos
          </Button>
          <Button color="danger" variant={showMessagesFrom === "sent" ? "solid" : "faded"} onClick={() => handleButtonClick("sent")}>
            Enviados
          </Button>
        </div>
        <div className="text-md font-bold">
          <p className="text-center pl-9">Welcome: {userName}</p>
        </div>
        <div className="text-md font-bold">
          <p className="text-center pl-9">{userMail}</p>
        </div>
        <div className="flex flex-row gap-3 pl-2 h-[30px]">
          <Avatar
            src={`https://placehold.co/155x232/black/white?text=${userName[0]?.toLocaleUpperCase()}`}
          />
          <Button color="primary" variant="bordered" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-around h-[90vh]">
        <ListEmail emails={emails} handleEmailSelected={handleEmailSelected} />
        <ViewEmail
          showMessagesFrom={showMessagesFrom}
          setEmailSelected={setEmailSelected}
          emailSelected={emailSelected}
          setUpdateMessages={setUpdateMessages}
          updateMessages={updateMessages}
        />
      </div>
      <div className="absolute bottom-20 right-10 shadow-2xl">
        <ModalEmail setUpdateMessages={setUpdateMessages} updateMessages={updateMessages}/>
      </div>
    </div>
  );
};

export default Home;