package de.hpi.xforms;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.w3c.dom.Element;

/**
 * 
 * @author jan-felix.schwarz@student.hpi.uni-potsdam.de
 *
 */
public class XForm extends XFormsElement implements UIElementContainer {
	
	protected List<XFormsUIElement> childElements;
	protected Model model;
	protected Element head;
	
	public XForm() {
		super();
		attributes.put("name", null);
	}

	public List<XFormsUIElement> getChildElements() {
		if(childElements==null)
			childElements = new ArrayList<XFormsUIElement>();
		Collections.sort(childElements, new UIElementComparator());
		return childElements;
	}

	public Model getModel() {
		return model;
	}

	public void setModel(Model model) {
		this.model = model;
	}
	
	public Element getHead() {
		return head;
	}

	public void setHead(Element head) {
		this.head = head;
	}

	public String getStencilId() {
		return "XForm";
	}
	
	public String getTagName() {
		return null;
	}

}
