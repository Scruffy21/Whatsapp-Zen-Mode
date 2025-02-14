import {DOM} from "../../../../../utility-belt/helpers/dom/DOM-shortcuts";
import {get_hovered_contact_el} from "../../../../api/get-hovered-contact-el";
import {throw_DOM_error} from "../../process-errors/process-error";
import {construct_Hide_contact_ctx_menu_item} from "./construct-hide-contact-item";
import {construct_Unhide_contact_ctx_menu_item} from "./construct-unhide-contact-item";
import {get_hovered_contact_raw_title} from "../../../user-can/hide-contacts/get-hovered-contact-name";

import {Selectors} from "../../../../data/dictionary";
import {findChatByTitle} from "../../../../whatsapp/ExtensionConnector";
import {Chat} from "../../../../whatsapp/model/Chat";
import {isHiddenChat} from "../../../../whatsapp/Storage";
import {isZenMorningChat} from "../../../user-can/zenmorning/setZenMorning";
import {construct_zenMorning_contact_ctx_menu_item} from "./construct-zenmorning-contact-item";


export let lastHoveredChat: Chat | null;

export function attach_hide_contact_item(node: Element): void {
  // prettier-ignore
  // Explain: It shouldn't be a ZM element using WA styling; eg ZM_CTX_MENU or RN area .
  if ([
        Selectors.ZM_RELEASE_NOTES_AREA.substring(1),
        Selectors.ZM_CTX_MENU.substring(1),
      ].includes(node.id)
  ) return;

  // Explain: If there is no hovered el in the DOM - it means the WA ctx menu has been..
  // invoked from chat area, not contact list area. In that case - break.
  const hoveredDivEl = get_hovered_contact_el();
  if (!hoveredDivEl) return;

  const waContactCtxMenuEl = DOM.get_el(Selectors.WA_CONTACT_CTX_MENU);

  if (!waContactCtxMenuEl) {
    throw_DOM_error(Selectors.WA_CONTACT_CTX_MENU, "WA_CONTACT_CTX_MENU");
    return;
  }
  const waContactCtxMenuListEl = DOM.get_el("ul > div", waContactCtxMenuEl);
  if (!waContactCtxMenuListEl) {
    throw_DOM_error(Selectors.WA_CONTACT_CTX_MENU, "WA_CONTACT_CTX_MENU");
    return;
  }

  const hoveredContactTitle = get_hovered_contact_raw_title();

  findChatByTitle(hoveredContactTitle, async (hoveredChat: Chat) => {
    lastHoveredChat = hoveredChat;
    const isHidden = await isHiddenChat(hoveredChat);
    const menuItemEl = isHidden
      ? construct_Unhide_contact_ctx_menu_item()
      : construct_Hide_contact_ctx_menu_item();
    menuItemEl.classList.add('first');
    const zenMorningItemEl = construct_zenMorning_contact_ctx_menu_item(
      await isZenMorningChat(hoveredChat)
    );
    waContactCtxMenuListEl.append(menuItemEl, zenMorningItemEl);
    waContactCtxMenuListEl.click(); // Corrects ctx menu visualization.
  });
}
