import { useDispatch, useSelector } from 'react-redux';
import { IUser } from '../../redux/Users/types';
import { AppDispatch, RootState } from '../../redux/store';
import './UserPage.scss';
import { useEffect, useState } from 'react';
import { getById, getUserslist, setUserAuth, updateUser } from '../../redux/Users';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '@mui/material';
import FileDrop from '../../components/FileDrop';
// import InputMask from 'react-input-mask';

const initialState = {} as IUser;

const UserPage = () => {
  const [formValues, setFormValues] = useState(initialState);
  const { currentUser, isUserAuth } = useSelector((state: RootState) => state.users);
  const [user, setUser] = useState(null as IUser | null);

  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const getUser = async () => {
    const user = (await axios.get(`http://localhost:3001/users/${id}`)).data;
    setUser(user);
    setFormValues(user);
  };

  useEffect(() => {
    getUser();

    if (id) {
      dispatch(setUserAuth(true));
    }
    dispatch(getById(id || null));
  }, []);

  const onChangeUserData = async () => {
    const payload: Partial<IUser> = {
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      avatarUrl: formValues.avatarUrl,
      birthdate: formValues.birthdate,
    };

    dispatch(updateUser(payload));
  };

  const onchange = (event: any) => {
    const key = event.target.name;
    const value = event.target.value;
    setFormValues({ ...formValues, [key]: value });
  };

  const changeUserAvatar = async (file: Blob) => {
    const formData = new FormData();
    formData.append('filedata', file);

    const url: string = (await axios.post(`http://localhost:5000/user/upload-avatar?userId=${user?.id}`, formData)).data;
    // @ts-ignore
    setUser({ ...user, avatarUrl: url });
  };

  return (
    <>
      {user ? (
        <>
          <div className="userPage">
            <div className="userPage__info">
              <div className="userPage__banner">
                <div className="userPage__banner-info">
                  <FileDrop onSendFiles={changeUserAvatar}>
                    <Avatar sx={{ height: '60px', width: '60px' }} src={`http://localhost:5000/` + user?.avatarUrl} alt="" />
                  </FileDrop>

                  <div className="userPage__banner-info-date">
                    <span className="username">{user?.username}</span>
                    <span className="email">{user?.email}</span>
                    <span className="birthdate">{user?.birthdate}</span>
                  </div>
                </div>
              </div>
            </div>
            {isUserAuth && currentUser.id === user.id ? (
              <>
                <div className="userPage__changes">
                  <input type="text" placeholder="Username" value={formValues.username} name="username" onChange={onchange} />
                  <input type="text" placeholder="Password" value={formValues.password} name="password" onChange={onchange} />
                  <input type="text" placeholder="Email" value={formValues.email} name="email" onChange={onchange} />
                  {/* <InputMask
                                        type="text"
                                        placeholder="Birthdate"
                                        value={formValues.birthdate}
                                        name="birthdate"
                                        onChange={onchange}
                                        mask="99.99.9999"
                                    /> */}
                  <button onClick={onChangeUserData}>Сохранить</button>
                </div>
              </>
            ) : (
              <>
                <span>Нет возможности редактирования, так как страница другого пользователя</span>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <h1>Такого пользователя не существует!</h1>
        </>
      )}
    </>
  );
};

export default UserPage;
