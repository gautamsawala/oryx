package de.hpi.epc;


import java.util.LinkedList;
import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;

import de.hpi.bpt.process.epc.Connector;
import de.hpi.bpt.process.epc.EPC;
import de.hpi.bpt.process.epc.Event;
import de.hpi.bpt.process.epc.Function;
import de.hpi.bpt.process.epc.IFlowObject;
import de.hpi.epc.Marking.NodeNewMarkingPair;

public class MarkingTest extends AbstractEPCTest {
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
	}

	@AfterClass
	public static void tearDownAfterClass() throws Exception {
	}

	@Before
	public void setUp() throws Exception {
	}

	@After
	public void tearDown() throws Exception {
	}
	
	public void testOrSplit(){
		epc = new EPC();
		
		IFlowObject e1 = add(new Event());
		IFlowObject f1 = add(new Function());
		connect(e1, f1);
		IFlowObject orSplit = add(new Connector(de.hpi.bpt.process.epc.ConnectorType.OR));
		connect(f1, orSplit);
		IFlowObject f2 = add(new Function());
		connect(orSplit, f2);
		IFlowObject f3 = add(new Function());
		connect(orSplit, f3);

		
		List<IFlowObject> startNodes = new LinkedList<IFlowObject>();
		startNodes.add(e1);
		Marking intialMarking = Marking.getInitialMarking(epc, startNodes);
		List<NodeNewMarkingPair> newMarkingPairs = intialMarking.propagate(epc);
		
		assertTrue(newMarkingPairs.size() == 1);
		assertEquals(newMarkingPairs.get(0).node, f1);
		
		newMarkingPairs = newMarkingPairs.get(0).newMarking.propagate(epc);
		
		assertTrue(newMarkingPairs.size() == 3);
		for(NodeNewMarkingPair nodeNewMarking : newMarkingPairs){
			assertEquals(nodeNewMarking.node, orSplit);
		}
	}
}
