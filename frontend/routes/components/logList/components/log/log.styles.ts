/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import styled from 'styled-components';
import { COLOR } from '../../../../../styles/colors';
import { Image } from '../../../../components/image';

export const Container = styled.div`
  cursor: ${(props: any) => props.clickable ? 'pointer' : 'default'};
  padding: 10px;
` as any;

export const UserMessage = styled.span`
  background-color: ${COLOR.WHITE};
  color: ${COLOR.BLACK_60};
  padding: 6px;
  box-shadow: 0 2px 5px ${COLOR.BLACK_6};
  display: inline-block;
  font-size: 12px;
  max-width: 82.5%;
`;

export const SystemMessage = styled.span`
  color: ${COLOR.BLACK_60};
  padding: 4px 0;
  display: inline-block;
  font-size: 12px;
`;

export const ScreenshotMessage = styled.span`
  background-color: ${COLOR.WHITE};
  padding: 6px;
  box-shadow: 0 2px 5px ${COLOR.BLACK_6};
  display: block;
  font-size: 12px;
  border-radius: 0 0 2px 2px;
`;

export const Info = styled.div`
  color: ${COLOR.BLACK_40};
  display: flex;
  font-size: 11px;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

export const ScreenshotWrapper = styled.div`
  width: 100%;
  padding-top: 42%;
  overflow: hidden;
  position: relative;
  margin: 8px 0 0;
  border-radius: ${(props: any) => props.withMessage ? '2px 2px 0 0' : '2px'};
` as any;

export const Screenshot = styled(Image)`
  img {
    display: block;
    max-width: 100%;
    width: 100%;
    height: auto;
    margin: auto;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
` as any;

export const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
`;

export const RemoveButtonWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;
